<template>
  <ComponentPanel
    :open="componentPanel.isOpen.value"
    @select="
      (selected) => {
        componentPanel.select(selected.schema)
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
        editedNode = undefined
      }
    "
    @insert-component="
      ({ targetNodeID }) => {
        // panel.targetNodeID.value = getTransientID(editedNode.value)
        componentPanel.open((schema) => {
          applyEdition(
            {
              type: 'add-component',
              targetId: targetNodeID!,
              position: 'after',
              schema,
            },
            contents.elements,
          )
        })
      }
    "
  />

  <Suspense>
    <TransientBuilder
      v-for="element in contents.elements"
      :dictionnary="dictionnary"
      :key="element.id"
      :element="element"
      @edit="
        (edition) => {
          applyEdition(edition, contents.elements)
        }
      "
    />
  </Suspense>

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
  {{ editedElement }}
  <Sidebar :open="sidebarIsOpen" id="sidebar">
    <ElementProps
      v-if="sidebarIsOpen"
      :component-props="editedNodeSchema!.props"
      :values="getElementProps(editedNodeSchema!, editedElement!)"
      @update="
        ({ prop, value, propName }) => {
          applyEdition(
            {
              type: 'update-prop',
              propName,
              prop,
              value,
              transientId: editedElement!.id,
            },
            contents.elements,
          )
        }
      "
    />
  </Sidebar>
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import {
  isSidebarOpen,
  useComponentPanel,
  useEditedNode,
  useEditedNodeBoundingBox,
  useEditedNodeElement,
  useEditedNodeSchema,
} from '@/lib/use-edition'
import RichTextEditor from './RichTextEditor.vue'
import { useWindowSize } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import { getElementProps } from 'transient'
import Sidebar from './Sidebar.vue'

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const { contents, saveToLocalStorage, loadFromLocalStorage } = usePage(component.template!)

const editedNode = useEditedNode()
const editedElement = useEditedNodeElement(contents)
const editedNodeSchema = useEditedNodeSchema()
const editedNodeBoundingBox = useEditedNodeBoundingBox()

const windowSize = useWindowSize()

const componentPanel = useComponentPanel()

const sidebarIsOpen = isSidebarOpen()
</script>

<style>
body {
  padding: 40px;
}
.sidebar {
  position: absolute;
  right: 0;
  top: 0;
  isolation: isolate;
  z-index: 99;
}
.text-editor {
  position: fixed;
  bottom: var(--richtext-editor-bottom);
  left: var(--richtext-editor-left);
  z-index: 1000;
}
</style>
