<template>
  <main ref="canvas" v-if="components">
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

  <template v-if="editor.editing.value">
    <TextSelection :targets="index.rootNodes(editor.editing.value.id)" />
  </template>
  <template v-else-if="editor.activeComponent.element.value">
    <SlotHighlight
      v-for="slot in index.slots(editor.activeComponent.element.value.id)"
      :key="slot.name"
      :targets="slot.nodes.length ? slot.nodes : slot.container"
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
  <div>Current component : {{ editor.activeComponent.element.value?.tag }}</div>
  <div>Selected slot :{{ editor.selectedSlot }}</div>
  <div>Editing: {{ editor.editing }}</div>
  <Button @click="template.saveToLocalStorage">Save</Button>
  <Button @click="template.loadFromLocalStorage">Load</Button>
</template>

<script setup lang="ts">
import { loadAllComponents, useDictionnary } from '@/lib/composables/use-dictionnary.ts'
import Button from '@/samples/Button.vue'
import { useTemplate } from '@/lib/composables/use-template.ts'
import { computedAsync, useEventListener } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import ComponentBuilder from './ComponentBuilder.vue'
import PropsPanel from './PropsPanel.vue'
import ComponentSelection from './ComponentSelection.vue'
import { useComponentPanel } from '@/lib/composables/use-components-panel.ts'
import ComponentPanel from './ComponentPanel.vue'
import SlotHighlight from './SlotHighlight.vue'
import { useIndex } from '@/lib/composables/use-index.ts'
import TextSelection from './TextSelection.vue'
import { useEditor } from '@/lib/use-editor.ts'

const canvas = useTemplateRef('canvas')
const index = useIndex()

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')
const components = computedAsync(async () => await loadAllComponents())

const componentPanel = useComponentPanel()

const template = useTemplate(component.template!)

const editor = useEditor(template.contents, dictionnary, index)

useEventListener(canvas, ['click'], (ev: MouseEvent) => {
  if (ev.target instanceof Element && ev.target.closest('[contenteditable="true"]')) return

  const target = ev.target instanceof Node ? ev.target : null
  const id = target ? index.closestAncestorId(target) : null
  if (!id) return editor.select(null)
  const slotName = index.vnode(id)?.component ? index.slotAt(id, target!) : undefined
  editor.pointOn(id, { x: ev.clientX, y: ev.clientY }, slotName ?? undefined)
})
</script>

<style></style>
