import {
  findElementById,
  getAncestorsChain,
  type TransientComponentDictionnary,
  type TransientComponentSchema,
  type TransientElement,
} from '@transient/ir'
import { computed, type Ref, readonly, ref, shallowRef } from 'vue'
import { applyEdition, type Edition } from '@/lib/edition/edition'
import { INLINE_TAGS } from '../edition/richtext'
import { createCan, type Rule } from '../edition/rules'
import { useElement } from './use-element'

export type Selection =
  | { kind: 'element'; id: string }
  | { kind: 'slot'; slotName: string; ownerId: string }

export type Editing = {
  id: string
  point: { x: number; y: number }
  slotName?: string
  // which copy of a slot rendered several times, in render order
  occurrence?: number
}

export function useEditor(
  component: Ref<TransientComponentSchema>,
  dictionnary: TransientComponentDictionnary,
  rules: Rule[] = [],
) {
  const can = createCan(rules, () => component.value.template.elements, dictionnary)
  const past = shallowRef<TransientComponentSchema[]>([])
  const canUndo = computed(() => past.value.length > 0)
  const future = shallowRef<TransientComponentSchema[]>([])
  const canRedo = computed(() => future.value.length > 0)

  const original = shallowRef<TransientComponentSchema>(snapshot(component.value))
  const isDirty = computed(() => {
    return JSON.stringify(original.value) !== JSON.stringify(component.value)
  })

  const selection = ref<Selection | null>(null)
  const editing = ref<Editing | null>(null)
  // latest first, capped
  const history = shallowRef<Edition[]>([])

  const ancestors = computed(() => {
    if (selection.value?.kind === 'element') {
      return getAncestorsChain(selection.value.id, component.value.template.elements)
    }

    return []
  })

  const owner = computed(() => {
    return ancestors?.value?.findLast(({ element }) => element.isComponent) ?? null
  })

  const selectedSlot = computed(() => {
    if (selection.value?.kind === 'slot') {
      return { ownerId: selection.value.ownerId, slotName: selection.value.slotName }
    }
    return owner.value ? { ownerId: owner.value.element.id, slotName: owner.value.slotName } : null
  })

  const selectedElement = computed(() => {
    if (selection.value?.kind === 'element') {
      return findElementById(component.value.template.elements, selection.value.id) ?? null
    }

    return null
  })

  const activeComponentId = computed<string | null>(() => {
    if (selection.value === null) {
      return null
    }

    if (selection.value.kind === 'element') {
      const element = selectedElement.value
      if (element?.isComponent) {
        return element.id
      }

      return owner.value?.element?.id ?? null
    }

    if (selection.value.kind === 'slot') {
      return selection.value.ownerId
    }

    return null
  })

  const activeComponent = useElement(activeComponentId, component, dictionnary)

  const editTarget = computed<{ id: string; slotName?: string } | null>(() => {
    const element = selectedElement.value
    if (!element || element.isComponent) return null

    const slot = selectedSlot.value
    if (slot) return { id: slot.ownerId, slotName: slot.slotName }

    // layout containers (only blocks inside) are selected, not edited
    return hasText(element) ? { id: element.id } : null
  })

  function pointOn(
    id: string,
    point: { x: number; y: number },
    slotName?: string,
    occurrence?: number,
  ) {
    if (slotName) {
      select({ kind: 'slot', ownerId: id, slotName })
      startEditing(id, point, slotName, occurrence)
      return
    }

    select({ kind: 'element', id })
    if (editTarget.value) {
      startEditing(editTarget.value.id, point, editTarget.value.slotName)
    }
  }

  function select(newSelection: Selection | null) {
    selection.value = newSelection
    stopEditing()
  }

  function edit(edition: Edition) {
    // the UI hides denied actions, this is what actually enforces the rules
    if (!can(edition.type, edition.element)) {
      console.warn(`[transient] ${edition.type} denied on <${edition.element.tag}>`)
      return
    }
    past.value = [...past.value, snapshot(component.value)].slice(-50)
    future.value = []
    applyEdition(edition, component.value?.template?.elements ?? [])
    history.value = [edition, ...history.value].slice(0, 20)
  }

  function undo() {
    const prev = past.value.at(-1)
    if (!prev) {
      return
    }
    future.value = [...future.value, snapshot(component.value)]

    past.value = past.value.slice(0, -1)
    component.value = prev
  }

  function redo() {
    const next = future.value.at(-1)
    if (!next) {
      return
    }
    past.value = [...past.value, snapshot(component.value)]

    future.value = future.value.slice(0, -1)
    component.value = next
  }

  function startEditing(
    id: string,
    point: { x: number; y: number },
    slotName?: string,
    occurrence?: number,
  ) {
    editing.value = { id, point, slotName, occurrence }
  }

  function stopEditing() {
    editing.value = null
  }

  function hasText(element: TransientElement): boolean {
    return !!element.slots?.default?.some((child) =>
      child.tag === '#text'
        ? !!String(child.attributes.value?.expression ?? '').trim()
        : INLINE_TAGS.has(child.tag) && hasText(child),
    )
  }

  function markAsSaved() {
    history.value = []
    future.value = []
    past.value = []
    original.value = snapshot(component.value)
  }

  return {
    can,
    select,
    selection: readonly(selection),
    selectedElement,
    selectedSlot,
    activeComponent,
    editing: readonly(editing),
    history: readonly(history),
    pointOn,
    edit,
    startEditing,
    stopEditing,
    isDirty,
    undo,
    redo,
    canUndo,
    canRedo,
    markAsSaved,
  }
}

function snapshot<T extends Record<string, unknown>>(record: T): T {
  return JSON.parse(JSON.stringify(record))
}
