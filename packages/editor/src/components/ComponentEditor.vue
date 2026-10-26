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

    <ComponentSelection
      v-if="editor.activeComponent.element.value"
      :root="index.rootNodes(editor.activeComponent.element.value.id)"
      :element="editor.activeComponent.element.value!"
      @edit="editor.edit"
      @insert-component="
        ({ targetID: targetNodeID }) => {
          componentPanel.open((schema) => {
            editor.edit({ type: 'add-component', targetId: targetNodeID, position: 'after', schema })
          })
        }
      "
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
        v-for="slot in index.slots(editor.activeComponent.element.value.id)"
        :key="slot.name"
        :targets="slot.container"
        :empty="slot.fallback || !slot.nodes.length"
        :slot-name="slot.name"
        :owner-id="editor.activeComponent.id.value!"
        @insert-component="
          ({ targetID: targetNodeID }) => {
            componentPanel.open((schema) => {
              editor.edit({
                type: 'add-component',
                targetId: targetNodeID,
                position: 'append',
                schema,
              })
            })
          }
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

    <!-- <ComponentPanel
      :open="componentPanel.isOpen.value"
      @select="
        (selected) => {
          componentPanel.select(selected.schema)
          componentPanel.close()
        }
      "
      @update:open="
        (open: boolean) => {
          if (!open) {
            // drawer has a crazy api should do somethign about it. Maybe wrap it.
            componentPanel.close()
          }
        }
      "
      @close="componentPanel.close"
      :dictionnary="dictionnary"
    /> -->
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
import { useEventListener } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import type { ResolveComponent } from '@/lib/components.ts'
import { useComponentPanel } from '@/lib/composables/use-components-panel.ts'
import { useEditor } from '@/lib/composables/use-editor.ts'
import { useIndex } from '@/lib/composables/use-index.ts'
import { useSlashMenu } from '@/lib/composables/use-slash-menu.ts'
import { INLINE_TAGS } from '@/lib/edition/richtext.ts'
import ComponentBuilder from './ComponentBuilder.vue'
import DebugPanel from './DebugPanel.vue'
import EditingFrame from './EditingFrame.vue'
import ElementPanel from './ElementPanel/ElementPanel.vue'
import ComponentSelection from './Frame/ComponentSelection.vue'
import SlotHighlight from './SlotHighlight.vue'

const { dictionnary, debug = false } = defineProps<{
  dictionnary: TransientComponentDictionnary
  resolveComponent?: ResolveComponent
  debug?: boolean
}>()

const component = defineModel<TransientComponentSchema>({ required: true })

const canvas = useTemplateRef('canvas')
const index = useIndex()

const componentPanel = useComponentPanel()
const slashMenu = useSlashMenu()

const editor = useEditor(component, dictionnary)

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

useEventListener(canvas, ['click'], (ev: MouseEvent) => {
  // a text node is never an event target: a slot rendered at a multi-root component's
  // root would resolve to the (foreign) parent element
  const text = textNodeAt(ev.clientX, ev.clientY)
  const target =
    text && ev.target instanceof Node && ev.target.contains(text)
      ? text
      : ev.target instanceof Node
        ? ev.target
        : null

  const clicked = target ? index.closestAncestorId(target) : null

  if (!clicked) {
    return editor.select(null)
  }

  // text and its formatting (<strong>, <a>…) belong to the closest block holding them.
  // Walk the template, not the DOM: a slot at a multi-root component's root has a foreign parent
  const self = findElementById(component.value.template.elements, clicked)
  const chain = getAncestorsChain(clicked, component.value.template.elements) ?? []
  const id =
    [...chain.map(({ element }) => element), self].findLast(
      (el) => el && !(el.tag === '#text' || (!el.isComponent && INLINE_TAGS.has(el.tag))),
    )?.id ?? clicked

  const slot = index.vnode(id)?.component ? index.slotAt(id, target!) : null

  editor.pointOn(id, { x: ev.clientX, y: ev.clientY }, slot?.name, slot?.occurrence)
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
</script>

<style></style>
