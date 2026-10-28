<template>
  <div class="tr-root" :style="{display: 'contents'}">
    <main ref="canvas" data-test="canvas">
      <ComponentBuilder
        v-model="index"
        :dictionnary="dictionnary"
        :template="component.template"
        :resolve-component="resolveComponent"
        :editing="editor.editing.value"
        @edit="editor.edit"
        @exit-editing="editor.stopEditing"
      />
    </main>

    <ComponentFrame
      v-if="editor.activeComponent.element.value"
      :root="index.rootNodes(editor.activeComponent.element.value.id)"
      :element="editor.activeComponent.element.value!"
      @edit="editor.edit"
    />
    <ComponentFrame
      v-if="
        hoveredElement &&
        !pointed?.slot &&
        hoveredElement.id !== editor.activeComponent.id.value &&
        !editor.editing.value
      "
      :key="hoveredElement.id"
      :root="index.rootNodes(hoveredElement.id)"
      :element="hoveredElement"
      hover
    />
    <!-- clicking a not-yet-selected component's slot edits it right away: preview that -->
    <EditingFrame
      v-if="hoveredSlot"
      :key="`${pointed!.id}-${pointed!.slot!.name}-${pointed!.slot!.occurrence}`"
      :targets="hoveredSlot.container"
      :slot-name="pointed!.slot!.name"
      hover
    />

    <template v-if="editor.editing.value && !editor.editing.value.slotName">
      <EditingFrame :targets="index.rootNodes(editor.editing.value.id)" />
    </template>
    <template v-else-if="editor.editing.value?.slotName">
      <EditingFrame
        :targets="
          index.slot(
            editor.editing.value.id,
            editor.editing.value.slotName,
            editor.editing.value.occurrence,
          )!.container
        "
        :slot-name="editor.editing.value.slotName"
      />
    </template>
    <template v-else-if="editor.activeComponent.element.value">
      <SlotHighlight
        v-for="slot in activeSlots"
        :key="`${slot.name}-${slot.occurrence}`"
        :targets="slot.container"
        :empty="slot.fallback || !slot.nodes.length"
        :slot-name="slot.name"
        :owner-id="editor.activeComponent.id.value!"
        :hover="
          !editor.editing.value &&
          isSlotHovered(editor.activeComponent.id.value!, slot.name, slot.occurrence)
        "
      />
    </template>

    <slot
      v-if="editor.activeComponent.element.value && editor.activeComponent.schema.value"
      name="panel"
      :element="editor.activeComponent.element.value"
      :schema="editor.activeComponent.schema.value"
      :template="component.template"
      :update-prop="updateProp"
      :close="closeComponent"
    >
      <ElementPanel
        v-if="Object.keys(editor.activeComponent.schema.value.props).length > 0"
        class="tr-fixed tr-top-[10%] tr-right-4"
        :model-value="editor.activeComponent.element.value"
        :schema="editor.activeComponent.schema.value"
        :template="component.template"
        @update-prop="updateProp"
        @close="closeComponent"
      />
    </slot>

    <ComponentPanel
      id="component-panel"
      v-if="componentPanel.isOpen.value"
      data-test="component-panel"
      @select="
        (selected) => {
          componentPanel.select(selected.schema)
          componentPanel.close()
        }
      "
      @close="componentPanel.close"
      :dictionnary="dictionnary"
    />

    <Toolbar
      id="toolbar"
      data-test="toolbar"
      :is-dirty="editor.isDirty.value"
      :can-undo="editor.canUndo.value"
      :can-redo="editor.canRedo.value"
      @undo="editor.undo"
      @redo="editor.redo"
    />
    <!-- <DebugPanel v-if="debug" :editor="editor" :template="component.template" :index="index" /> -->
    <!-- <SlashMenu
      v-if="slashMenu.open.value && slashMenu.rect.value"
      class="fixed z-50 w-72"
      id="slash-menu"
      :style="{
        top: `${slashMenu.rect.value.bottom + 4}px`,
        left: `${slashMenu.rect.value.left}px`,
      }"
      :dictionnary="dictionnary"
    /> -->
  </div>
</template>

<script setup lang="ts">
import {
  type BindingValue,
  findElementById,
  getAncestorsChain,
  type TransientComponentDictionnary,
  type TransientComponentSchema,
  type TransientProp,
} from '@transient/ir'
import { useEventListener, watchOnce, whenever } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import type { ResolveComponent } from '@/lib/components.ts'
import { useComponentPanel } from '@/lib/composables/use-components-panel.ts'
import { useEditor } from '@/lib/composables/use-editor.ts'
import { useIndex } from '@/lib/composables/use-index.ts'
import { useSlashMenu } from '@/lib/composables/use-slash-menu.ts'
import { provideTemplate } from '@/lib/composables/use-template.ts'
import { INLINE_TAGS } from '@/lib/edition/richtext.ts'
import ComponentBuilder from './ComponentBuilder.vue'
import ComponentPanel from './ComponentPanel/ComponentPanel.vue'
import ElementPanel from './ElementPanel/ElementPanel.vue'
import ComponentFrame from './Frame/ComponentFrame.vue'
import EditingFrame from './Frame/EditingFrame.vue'
import SlotHighlight from './SlotHighlight.vue'
import Toolbar from './Toolbar.vue'

const { dictionnary, debug = false } = defineProps<{
  dictionnary: TransientComponentDictionnary
  resolveComponent?: ResolveComponent
  debug?: boolean
}>()

const component = defineModel<TransientComponentSchema>({ required: true })
const template = computed(() => component.value.template)
provideTemplate(template)

const canvas = useTemplateRef('canvas')
const index = useIndex()

const componentPanel = useComponentPanel()
const slashMenu = useSlashMenu()

const editor = useEditor(component, dictionnary)

const pointed = ref<PointedElement | null>(null)
// computed: only notifies when the id changes, not on every pointermove
const hoveredId = computed(() => pointed.value?.id ?? null)
const hoveredElement = computed(() =>
  hoveredId.value ? findElementById(component.value.template.elements, hoveredId.value) : null,
)
const activeSlots = computed(() => {
  const id = editor.activeComponent.id.value
  const slots = id ? index.slots(id) : []
  return slots.map((slot) => ({
    ...slot,
    occurrence: slots.filter((s) => s.name === slot.name).indexOf(slot),
  }))
})

const hoveredSlot = computed(() => {
  const hit = pointed.value
  // the selected component's slots are already outlined by SlotHighlight
  if (!hit?.slot || editor.editing.value || hit.id === editor.activeComponent.id.value) return null
  return index.slot(hit.id, hit.slot.name, hit.slot.occurrence) ?? null
})

function isSlotHovered(ownerId: string, name: string, occurrence: number) {
  const slot = pointed.value?.slot
  return hoveredId.value === ownerId && slot?.name === name && slot.occurrence === occurrence
}
useEventListener(canvas, 'pointermove', (ev) => {
  pointed.value = pointedElement(ev)
})
useEventListener(canvas, 'pointerleave', () => {
  pointed.value = null
})

// useEventListener('keypress', (ev) => {
//   if(editor.editing.value){
//     if(ev.key === '/'){
//       const slashMenu = useSlashMenu()
//       slashMenu.open.value = true
//       const sel = window.getSelection()
//       const range = sel?.getRangeAt(0)
//       slashMenu.rect.value = range?.getBoundingClientRect() ?? null
//       slashMenu.point.value = editor.editing.value.point
//       const stop = useEventListener('click', (ev) => {
//         if(ev.target && ev.target instanceof Node){
//           if(!document.querySelector('#slash-menu')?.contains(ev.target)){
//             slashMenu.open.value = false
//             slashMenu.point.value = null
//             stop()
//           }
//         }
//       })
//     }
//   }
// })

// caretPositionFromPoint snaps to the *closest* text (padding, blank space next to a
// line): keep it only if the point is really on the text's rendered lines
function textNodeAt(x: number, y: number): Text | null {
  const node = document.caretPositionFromPoint(x, y)?.offsetNode
  if (!(node instanceof Text)) return null
  const range = document.createRange()
  range.selectNodeContents(node)
  const onText = [...range.getClientRects()].some(
    ({ left, right, top, bottom }) => x >= left && x <= right && y >= top && y <= bottom,
  )
  return onText ? node : null
}

whenever(componentPanel.isOpen, () => {
  watchOnce(editor.selection, componentPanel.close)
})

useEventListener(canvas, ['click'], (ev: MouseEvent) => {
  const hit = pointedElement(ev)

  if (!hit) {
    return editor.select(null)
  }

  const { id, slot, x, y } = hit

  editor.pointOn(id, { x, y }, slot?.name, slot?.occurrence)
})

function updateProp({
  prop,
  propName,
  value,
}: {
  prop: TransientProp
  propName: string
  value: BindingValue
}) {
  editor.edit({
    type: 'update-prop',
    prop,
    propName,
    value,
    transientId: editor.activeComponent.id.value!,
  })
}

function closeComponent() {
  editor.select(null)
}

type PointedElement = {
  id: string
  x: number
  y: number
  slot: { name: string; occurrence: number } | null
}

function pointedElement(ev: MouseEvent): null | PointedElement {
  const text = textNodeAt(ev.clientX, ev.clientY)
  const target =
    text && ev.target instanceof Node && ev.target.contains(text)
      ? text
      : ev.target instanceof Node
        ? ev.target
        : null

  const clicked = target ? index.closestAncestorId(target) : null

  if (!clicked) {
    return null
  }

  const self = findElementById(component.value.template.elements, clicked)
  const chain = getAncestorsChain(clicked, component.value.template.elements) ?? []
  const id =
    [...chain.map(({ element }) => element), self].findLast(
      (el) => el && !(el.tag === '#text' || (!el.isComponent && INLINE_TAGS.has(el.tag))),
    )?.id ?? clicked

  const slot = index.vnode(id)?.component ? index.slotAt(id, target!) : null

  return { id, slot, x: ev.clientX, y: ev.clientY }
}
</script>

<style></style>
