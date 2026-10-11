<template>
  <main ref="canvas" v-if="components" data-test="canvas">
    <ComponentBuilder
      v-model="index"
      :dictionnary="dictionnary"
      :template="template.contents.value"
      :components="components"
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
  <template v-else-if="editor.editing.value && editor.editing.value.slotName">
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
      :empty="slot.fallback"
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

  <PropsPanel
    :schema="editor.activeComponent.schema.value"
    :component-props="editor.activeComponent.props.value"
    @close="() => editor.select(null)"
    @update="
      ({ prop, propName, value }) => {
        editor.edit({
          type: 'update-prop',
          prop,
          propName,
          value,
          transientId: editor.activeComponent.id.value!,
        })
      }
    "
  />
  <ComponentPanel
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
  />
  <DebugPanel v-if="debug" :editor="editor" :template="template.contents.value" :index="index" />
  <Button @click="template.saveToLocalStorage">Save</Button>
  <Button @click="template.loadFromLocalStorage">Load</Button>
  <!-- <SlashMenu
    v-if="slashMenu.open.value && slashMenu.rect.value"
    class="fixed z-50 w-72"
    id="slash-menu"
    :style="{
      top: `${slashMenu.rect.value.bottom + 4}px`,
      left: `${slashMenu.rect.value.left}px`,
    }"
  /> -->
</template>

<script setup lang="ts">
import { loadAllComponents, useDictionnary } from '@/lib/composables/use-dictionnary.ts'
import Button from '@/samples/Button.vue'
import { useTemplate } from '@/lib/composables/use-template.ts'
import { computedAsync, useEventListener } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import ComponentBuilder from './ComponentBuilder.vue'
import PropsPanel from './PropsPanel.vue'
import ComponentSelection from './ComponentSelection.vue'
import { useComponentPanel } from '@/lib/composables/use-components-panel.ts'
import ComponentPanel from './ComponentPanel.vue'
import SlotHighlight from './SlotHighlight.vue'
import { useIndex } from '@/lib/composables/use-index.ts'
import { useEditor } from '@/lib/composables/use-editor.ts'
import DebugPanel from './DebugPanel.vue'
import EditingFrame from './EditingFrame.vue'
import { useSlashMenu } from '@/lib/composables/use-slash-menu.ts'
import SlashMenu from './SlashMenu.vue'

const canvas = useTemplateRef('canvas')
const index = useIndex()

const dictionnary = useDictionnary()

// ?page=Slots loads another template (e2e fixtures live in src/tests/e2e), &debug=false hides the debug panel
const route = useRoute()
const component = dictionnary.get((route.query.page as string | undefined) ?? 'HomePage')
const debug = route.query.debug !== 'false'
const components = computedAsync(async () => await loadAllComponents())

const componentPanel = useComponentPanel()
const slashMenu = useSlashMenu()

const template = useTemplate(component.template!)

const editor = useEditor(template.contents, dictionnary)

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

  const id = target ? index.closestAncestorId(target) : null

  if (!id) {
    return editor.select(null)
  }
  const slot = index.vnode(id)?.component ? index.slotAt(id, target!) : null

  editor.pointOn(id, { x: ev.clientX, y: ev.clientY }, slot?.name, slot?.occurrence)
})
</script>

<style></style>
