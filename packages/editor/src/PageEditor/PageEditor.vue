<template>
  <ComponentPanel
    :open="componentPanel.isOpen.value"
    @edit="
      (edition) => {
        applyEdition(edition, contents.elements)
        componentPanel.close()
      }
    "
  />
  <RichTextEditor
    v-if="editedNode"
    :style="{
      '--richtext-editor-bottom': editedNodeBoundingBox
        ? `${windowSize.height.value - editedNodeBoundingBox.top}px`
        : undefined,
      '--richtext-editor-left': editedNodeBoundingBox
        ? editedNodeBoundingBox?.left + 'px'
        : undefined,
    }"
    class="text-editor"
    @delete="
      (edition) => {
        applyEdition(edition, contents.elements)
      }
    "
  />

  <Suspense>
    <TransientBuilder
      v-for="element in contents.elements"
      :dictionnary="dictionnary"
      :element="element"
      @edit="
        (edition) => {
          applyEdition(edition, contents.elements)
        }
      "
    />
  </Suspense>

  <JsonViewer
    v-if="contents"
    :value="contents"
    copyable
    boxed
    sort
    expanded
    :expanded-depth="5"
    theme="dark"
  />

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useComponentPanel, useEditedNode, useEditedNodeBoundingBox } from '@/lib/use-edition'
import RichTextEditor from './RichTextEditor.vue'
import { useWindowSize } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import TransientBuilder2 from './TransientBuilder.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const { contents, saveToLocalStorage, loadFromLocalStorage } = usePage(component.template!)

const editedNode = useEditedNode()
const editedNodeBoundingBox = useEditedNodeBoundingBox()
const windowSize = useWindowSize()

const componentPanel = useComponentPanel()
</script>

<style>
body {
  padding: 40px;
}
.text-editor {
  position: fixed;
  bottom: var(--richtext-editor-bottom);
  left: var(--richtext-editor-left);
  z-index: 1000;
}
</style>
