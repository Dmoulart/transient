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
    @remove="
      (transientID) => {
        remove(transientID)
      }
    "
  />

  <Suspense>
    <TransientBuilder v-if="contents" :dictionnary="dictionnary" :template="contents" />
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
import {
  assert,
  assertIs,
  assertIsArrayOfLength,
  assertIsDefined,
  someHTMLElement,
} from 'transient/src/core/assert'
const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const {
  contents,
  replace,
  remove,
  replaceSlot,
  insertAfter,
  saveToLocalStorage,
  loadFromLocalStorage,
} = usePage(component.template!)

const { onEditEnd } = useEdition()
const editedNode = useEditedNode()
const editedNodeBoundingBox = useEditedNodeBoundingBox()
const windowSize = useWindowSize()

onEditEnd((element, node) => {
  console.log({ replaceElement: element })

  assertIs(someHTMLElement, node)
  debugger
  if (node.dataset.transientSlot) {
    const [slot, ownerId] = node.dataset.transientSlot.split(':')
    const contents = element.slots![slot]!
    console.log({ contents })
    replaceSlot(contents, slot, ownerId)
    // replace(element)
  } else if (node.dataset.transientId) {
    replace(element)
  }
})

const componentPanel = useComponentPanel()

const addComponent = ({ path, schema }: { path: string; schema: TransientComponentSchema }) => {
  console.log('Adding component:', path, schema)
  const componentSchema = dictionnary.get(schema.tag)

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
    // isComponent: boolean;
    // attributes: Record<string, BindingInfo>;
    // ...componentSchema.template.elements[0],
    tag: componentSchema.tag,
    isComponent: true,
    attributes: {},
    id: crypto.randomUUID(),
  }

  console.log('New component to insert:', newComponent)

  insertAfter(componentPanel.targetNodeID.value, newComponent)

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
