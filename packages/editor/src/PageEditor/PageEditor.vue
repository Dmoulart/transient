<template>
  <ComponentPanel :open="componentPanel.isOpen.value" @select="addComponent" />
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
    :expanded-depth="5"
    theme="dark"
  />

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
</template>

<script setup lang="ts">
import { getTransientComponentSchemaByPath, registry } from '@/lib/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import TransientBuilder from './TransientBuilder.vue'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import {
  useComponentPanel,
  useEditedNode,
  useEditedNodeBoundingBox,
  useEdition,
} from '@/lib/use-edition'
import { ref } from 'vue'
import RichTextEditor from './RichTextEditor.vue'
import { useWindowSize } from '@vueuse/core'
import EditorComponents from './EditorComponents.vue'
import ComponentPanel from './ComponentPanel.vue'
import type { TransientComponentSchema } from 'transient/src/transient'
import type { TransientElement } from 'transient/src/transient/definition'
import { findElementById, insertAfterElement } from 'transient/src/transient/ast'
import { getTransientID } from 'transient/src/analyzers/html/html'
import { assert, assertIsArrayOfLength, assertIsDefined } from 'transient/src/core/assert'

const component = getTransientComponentSchemaByPath(
  '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
)

const { contents, replace, render, insertAfter, saveToLocalStorage, loadFromLocalStorage } =
  usePage(component.template!)

const forceRerender = ref(0)

const { onEditEnd } = useEdition()
const editedNode = useEditedNode()
const editedNodeBoundingBox = useEditedNodeBoundingBox()
const windowSize = useWindowSize()

onEditEnd((element) => {
  // patch(element)
  console.log({ replaceElement: element })
  replace(element)
  render()
  forceRerender.value++
})

const componentPanel = useComponentPanel()

const addComponent = ({ path, schema }: { path: string; schema: TransientComponentSchema }) => {
  console.log('Adding component:', path, schema)
  const componentSchema = registry.value[path]

  if (!componentSchema) {
    console.error(`Component schema not found for path: ${path}`)
    return
  }
  assertIsDefined(componentPanel.targetNodeID.value, 'Component panel should have a target node')
  assertIsDefined(
    componentSchema.template?.elements,
    'editedNode should be defined when adding a component',
  )

  const newComponent: TransientElement = {
    tag: componentSchema.name,
    isComponent: true,
    attributes: {},
    // isComponent: boolean;
    // attributes: Record<string, BindingInfo>;
    // ...componentSchema.template.elements[0],
    id: crypto.randomUUID(),
  }

  console.log('New component to insert:', newComponent)

  insertAfter(componentPanel.targetNodeID.value, newComponent)

  render()
  forceRerender.value++
  componentPanel.close()
}
</script>

<style scoped>
.text-editor {
  position: fixed;
  bottom: var(--richtext-editor-bottom);
  left: var(--richtext-editor-left);
  z-index: 1000;
}
</style>
