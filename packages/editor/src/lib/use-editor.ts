import {
  findElementById,
  findNearestAncestor,
  getAncestorsChain,
  type TransientTemplate,
} from 'transient'
import type { ComponentDictionnary } from './composables/use-dictionnary'
import { computed, readonly, ref, type Ref } from 'vue'
import { useElement } from './use-element'
import { applyEdition, type Edition } from '@/editor/edition'

export type Selection =
  | { kind: 'element'; id: string }
  | { kind: 'slot'; slotName: string; ownerId: string }

export type Editing = { id: string; point: { x: number; y: number }; slotName?: string }

export function useEditor(template: Ref<TransientTemplate>, dictionnary: ComponentDictionnary) {
  const selection = ref<Selection | null>(null)
  const editing = ref<Editing | null>(null)

  const ancestors = computed(() => {
    if (selection.value?.kind === 'element') {
      return getAncestorsChain(selection.value.id, template.value.elements)
    }
    return []
  })

  const owner = computed(() => {
    return ancestors?.value?.findLast(({ element }) => element.isComponent) ?? null
  })

  const selectedSlot = computed(() => {
    if (selection.value?.kind === 'slot') {
      return owner.value
    }
    return owner.value ?? null
  })

  const selectedElement = computed(() => {
    if (selection.value?.kind === 'element') {
      return findElementById(template.value.elements, selection.value.id) ?? null
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

  const activeComponent = useElement(activeComponentId, template, dictionnary)

  function select(newSelection: Selection) {
    selection.value = newSelection
  }

  function edit(edition: Edition) {
    applyEdition(edition, template.value.elements)

    //@todo relocate
    if (edition.type === 'replace-slot-content') {
      stopEditing()
    }
  }

  function startEditing(id: string, point: { x: number; y: number }, slotName?: string) {
    editing.value = { id, point, slotName }
  }

  function stopEditing() {
    editing.value = null
  }

  return {
    select,
    selection: readonly(selection),
    selectedElement,
    selectedSlot,
    activeComponent,
    editing: readonly(editing),
    edit,
    startEditing,
    stopEditing,
  }
}
