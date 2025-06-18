<template>
  <RichTextEditor
    v-if="!!editedNode"
    :style="{
      '--richtext-opacity': editedNodeBoundingBox ? 1 : 0,
      '--richtext-editor-top': editedNodeBoundingBox
        ? `calc(${editedNodeBoundingBox.top}px - ${editedNodeBoundingBox.height}px)`
        : undefined,
      '--richtext-editor-left': editedNodeBoundingBox
        ? editedNodeBoundingBox?.left + 'px'
        : undefined,
    }"
    class="text-editor"
  />

  <Suspense>
    <TransientBuilder
      :key="forceRerender"
      v-if="contents"
      :template="contents"
      :registry="registry"
    />
  </Suspense>

  <JsonViewer
    v-if="contents"
    :value="contents"
    copyable
    boxed
    sort
    expanded
    :expanded-depth="4"
    theme="dark"
  />

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
</template>

<script setup lang="ts">
import { getTransientComponentSchema, registry } from '@/lib/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import TransientBuilder from './TransientBuilder.vue'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useEditedNode, useEditedNodeBoundingBox, useEdition } from '@/lib/use-edition'
import { ref } from 'vue'

import RichTextEditor from './RichTextEditor.vue'

const component = getTransientComponentSchema(
  '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
)

const { contents, replace, render, saveToLocalStorage, loadFromLocalStorage } = usePage(
  component.template!,
)

const forceRerender = ref(0)

const { onEditEnd } = useEdition()
const editedNode = useEditedNode()
const editedNodeBoundingBox = useEditedNodeBoundingBox()

onEditEnd((element) => {
  // patch(element)
  console.log({ replaceElement: element })
  replace(element)
  render()
  forceRerender.value++
})
</script>

<style scoped>
.text-editor {
  position: fixed;
  top: var(--richtext-editor-top);
  left: var(--richtext-editor-left);
  opacity: var(--richtext-opacity);
  transition: opacity 0.2s ease-in-out;
  z-index: 1000;
}
</style>
