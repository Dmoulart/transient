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
    v-if="editedNode.node.value"
    :node="editedNode.node.value"
    :style="{
      '--richtext-editor-bottom': editedNode.bbox.value
        ? `${windowSize.height.value - editedNode.bbox.value.top}px`
        : undefined,
      '--richtext-editor-left': editedNode.bbox.value
        ? `${editedNode.bbox.value.left ?? 0}px`
        : undefined,
    }"
    class="text-editor"
    @delete="
      (edition) => {
        applyEdition(edition, contents.elements)
        editedNode.node.value = null
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
      @select="
        (selectedNode) => {
          editedNode.node.value = selectedNode
        }
      "
      @edit="
        (edition) => {
          applyEdition(edition, contents.elements)
        }
      "
    />
  </Suspense>

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
  {{ editedNode.element.value }}
  <TSidebar :open="sidebarIsOpen" id="sidebar">
    <ElementProps
      v-if="editedNode.schema.value && sidebarIsOpen"
      :component-props="editedNode.schema.value?.props"
      :values="getElementProps(editedNode.schema.value, editedNode.element.value!)"
      @update="
        ({ prop, value, propName }) => {
          applyEdition(
            {
              type: 'update-prop',
              propName,
              prop,
              value,
              transientId: editedNode.element.value!.id,
            },
            contents.elements,
          )
        }
      "
    />
  </TSidebar>
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useComponentPanel, useNode } from '@/lib/use-edition'
import RichTextEditor from './RichTextEditor.vue'
import { useWindowSize } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import { getElementProps } from 'transient'
import TSidebar from './TSidebar.vue'
import { ref } from 'vue'

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const { contents, saveToLocalStorage, loadFromLocalStorage } = usePage(component.template!)

const editedNode = useNode(contents, dictionnary)

const windowSize = useWindowSize()

const componentPanel = useComponentPanel()

const sidebarIsOpen = ref(false)
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
