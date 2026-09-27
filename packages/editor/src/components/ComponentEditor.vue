<template>
  <main ref="canvas" v-if="components">
    <ComponentBuilder
      :dictionnary="dictionnary"
      :template="template.contents.value"
      :components="components"
      @edit="apply"
    />
  </main>

  <ComponentSelection
    v-if="selection.component.root.value && selection.component.ir.value"
    :root="selection.component.root.value"
    :ir="selection.component.ir.value"
    @edit="apply"
    @insert-component="
      ({ targetID: targetNodeID }) => {
        componentPanel.open((schema) => {
          apply({ type: 'add-component', targetId: targetNodeID, position: 'after', schema })
        })
      }
    "
  />
  <template v-if="selection.component.slots.value">
    <SlotHighlight
      v-for="(slot, slotName) in selection.component.slots.value"
      :key="slotName"
      :targets="slot"
      :slot-name="slotName"
      :owner-id="selection.component.id.value!"
      @insert-component="
        ({ targetID: targetNodeID }) => {
          componentPanel.open((schema) => {
            apply({ type: 'add-component', targetId: targetNodeID, position: 'append', schema })
          })
        }
      "
    />
  </template>
  <PropsPanel
    :schema="selection.component.schema.value"
    :component-props="selection.component.props.value"
    @close="() => (selection.selected.node.value = null)"
    @update="
      ({ prop, propName, value }) => {
        apply({
          type: 'update-prop',
          prop,
          propName,
          value,
          transientId: selection.component.id.value!,
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

  <Button @click="template.saveToLocalStorage">Save</Button>
  <Button @click="template.loadFromLocalStorage">Load</Button>
</template>

<script setup lang="ts">
import { loadAllComponents, useDictionnary } from '@/lib/composables/use-dictionnary.ts'
import Button from '@/samples/Button.vue'
import { useTemplate } from '@/lib/composables/use-template.ts'
import { computedAsync, useEventListener } from '@vueuse/core'
import { applyEdition, type Edition } from '@/editor/edition'
import { shallowRef, useTemplateRef } from 'vue'
import { useSelection } from '@/lib/composables/use-selection.js'
import { someHTMLElement } from 'transient'
import ComponentBuilder from './ComponentBuilder.vue'
import PropsPanel from './PropsPanel.vue'
import { findClosestAncestorComponentElement, getSiblingElementWithIr } from '@/lib/ir/dom.ts'
import ComponentSelection from './ComponentSelection.vue'
import { useComponentPanel } from '@/lib/composables/use-components-panel.ts'
import ComponentPanel from './ComponentPanel.vue'
import SlotHighlight from './SlotHighlight.vue'

const canvas = useTemplateRef('canvas')

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')
const components = computedAsync(async () => await loadAllComponents())

const componentPanel = useComponentPanel()

const template = useTemplate(component.template!)

const selection = useSelection(shallowRef(null), template.contents, dictionnary)

function apply(edition: Edition) {
  applyEdition(edition, template.contents.value.elements)
}

useEventListener(canvas, ['click', 'focusin'], (ev: MouseEvent) => {
  selection.selected.node.value = someHTMLElement(ev.target)
    ? (getSiblingElementWithIr(ev.target) ?? findClosestAncestorComponentElement(ev.target))
    : null
})
</script>

<style></style>
