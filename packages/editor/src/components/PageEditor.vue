<template>
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

  <Suspense>
    <main id="canvas" ref="canvas">
      <TransientBuilder
        v-for="element in page.contents.value.elements"
        :dictionnary="dictionnary"
        :key="element.id"
        :element="element"
        @edit="apply"
      />
    </main>
  </Suspense>

  <Button @click="page.saveToLocalStorage">Save</Button>
  <Button @click="page.loadFromLocalStorage">Load</Button>
  selected: {{ selection.selected.node.value && selection.selected.node.value.tagName }} text:
  {{ selection.text.node.value && selection.text.node.value.tagName }}
  <ComponentSelection
    v-if="selection.component.node.value"
    :node="selection.component.node.value"
    :text="selection.text.node.value"
    @edit="apply"
    @insert-component="
      ({ targetNodeID }) => {
        componentPanel.open((schema) => {
          apply({ type: 'add-component', targetId: targetNodeID, position: 'after', schema })
        })
      }
    "
  />
  <template v-if="selection.component.slotsNodes.value">
    <SlotHighlight
      v-for="slot in selection.component.slotsNodes.value"
      :key="getNodeId(slot)!"
      :node="slot"
      @insert-component="
        ({ targetNodeID }) => {
          componentPanel.open((schema) => {
            apply({ type: 'add-component', targetId: targetNodeID, position: 'append', schema })
          })
        }
      "
    />
  </template>
  <TDrawer
    id="props-panel"
    :open="!!selection.component.node.value"
    @close="
      () => {
        selection.selected.node.value = null
      }
    "
    @click.stop
  >
    <div v-if="selection.component.schema.value" class="flex flex-col gap-4">
      <h2>{{ selection.component.schema.value?.tag }}</h2>
      <ElementProps
        :props-schema="selection.component.schema.value?.props"
        :values="selection.component.props.value ?? {}"
        @update="
          ({ prop, value, propName }) => {
            apply({
              type: 'update-prop',
              propName,
              prop,
              value,
              transientId: selection.component.element.value!.id,
            })
          }
        "
      />
    </div>
  </TDrawer>
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { getNodeId, useComponentPanel } from '@/lib/use-node.js'
import { useEventListener } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition, type Edition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import TDrawer from './TDrawer.vue'
import { nextTick, shallowRef, useTemplateRef } from 'vue'
import { useSelection } from '@/lib/use-selection.js'
import { someHTMLElement } from 'transient'
import ComponentSelection from './ComponentSelection.vue'
import SlotHighlight from './SlotHighlight.vue'

const canvas = useTemplateRef('canvas')

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const page = usePage(component.template!)

const selection = useSelection(shallowRef(null), page.contents, dictionnary)

const componentPanel = useComponentPanel()

function apply(edition: Edition) {
  applyEdition(edition, page.contents.value.elements)
  // a deleted node leaves the DOM: drop the stale selection
  nextTick(() => {
    if (selection.selected.node.value?.isConnected === false) selection.selected.node.value = null
  })
}

useEventListener(canvas, 'click', (ev: MouseEvent) => {
  // a click lands on the innermost element (a <strong> inside an editable <p>): resolve to the editable container
  selection.selected.node.value = someHTMLElement(ev.target)
    ? ev.target.closest<HTMLElement>('[data-transient-id], [data-transient-slot]')
    : null
})
</script>

<style></style>
