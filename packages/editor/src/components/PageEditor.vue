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
  <RichTextEditor
    v-if="selection.text.node.value"
    :node="selection.text.node.value"
    :style="{
      '--richtext-editor-bottom': selection.text.bbox
        ? `${windowSize.height.value - selection.text.bbox.top.value}px`
        : undefined,
      '--richtext-editor-left': selection.text.bbox
        ? `${selection.text.bbox.left.value ?? 0}px`
        : undefined,
    }"
    class="text-editor"
    @delete="
      (edition) => {
        applyEdition(edition, page.contents.value.elements)
        selection.selected.node.value = null
      }
    "
    @insert-component="
      ({ targetNodeID }) => {
        componentPanel.open((schema) => {
          applyEdition(
            {
              type: 'add-component',
              targetId: targetNodeID!,
              position: 'after',
              schema,
            },
            page.contents.value.elements,
          )
        })
      }
    "
  />
  <Suspense>
    <main id="canvas" ref="canvas">
      <TransientBuilder
        v-for="element in page.contents.value.elements"
        :dictionnary="dictionnary"
        :key="element.id"
        :element="element"
        @edit="
          (edition) => {
            applyEdition(edition, page.contents.value.elements)
          }
        "
      />
    </main>
  </Suspense>

  <Button @click="page.saveToLocalStorage">Save</Button>
  <Button @click="page.loadFromLocalStorage">Load</Button>
  selected: {{ selection.selected.node.value && selection.selected.node.value.tagName }}
  <BoundingBox
    :key="canvasChanges"
    v-if="selection.selected.node.value"
    :node="selection.selected.node.value"
  />

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
            console.log('update prop')
            applyEdition(
              {
                type: 'update-prop',
                propName,
                prop,
                value,
                transientId: selection.component.element.value!.id,
              },
              page.contents.value.elements,
            )
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
import { isNodeEditable, useComponentPanel } from '@/lib/use-node.js'
import RichTextEditor from './RichTextEditor.vue'
import { useEventListener, useMutationObserver, useWindowSize } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import TDrawer from './TDrawer.vue'
import { ref, shallowRef, useTemplateRef } from 'vue'
import { useSelection } from '@/lib/use-selection.js'
import { someHTMLElement } from 'transient'
import BoundingBox from './BoundingBox.vue'

const canvas = useTemplateRef('canvas')

// brute force change detection to update bbox
// @todo find a more efficient method. Maybe a custom useElementBounding wrapper
const canvasChanges = ref(0)
useMutationObserver(
  canvas,
  () => {
    canvasChanges.value += 1
  },
  {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  },
)

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const page = usePage(component.template!)

const selection = useSelection(shallowRef(null), page.contents, dictionnary)

const windowSize = useWindowSize()

const componentPanel = useComponentPanel()

useEventListener(canvas, 'click', (ev: MouseEvent) => {
  if (!ev.target || !someHTMLElement(ev.target) || !isNodeEditable(ev.target)) {
    selection.selected.node.value = null
    return
  }
  selection.selected.node.value = ev.target
})
</script>

<style>
.text-editor {
  position: fixed;
  bottom: var(--richtext-editor-bottom);
  left: var(--richtext-editor-left);
  z-index: 1000;
}
</style>
