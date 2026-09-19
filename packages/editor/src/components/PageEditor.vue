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
    v-if="editedNode.textEditable.value"
    :node="editedNode.node.value!"
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
        applyEdition(edition, page.contents.value.elements)
        editedNode.node.value = null
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
    <TransientBuilder
      v-for="element in page.contents.value.elements"
      :dictionnary="dictionnary"
      :key="element.id"
      :element="element"
      @select="
        (selectedNode) => {
          if (!selectedNode && shouldOpenSidebar) {
            return
          }
          editedNode.node.value = selectedNode
        }
      "
      @edit="
        (edition) => {
          applyEdition(edition, page.contents.value.elements)
        }
      "
    />
  </Suspense>

  <Button @click="page.saveToLocalStorage">Save</Button>
  <Button @click="page.loadFromLocalStorage">Load</Button>

  <TSidebar
    :open="sidebarIsOpen"
    id="sidebar"
    @update:open="
      (open: boolean) => {
        if (!open) {
          onSidebarClose()
        }
      }
    "
    @close="onSidebarClose"
  >
    <ElementProps
      v-if="editedNode.schema.value"
      :props-schema="editedNode.schema.value?.props"
      :values="editedNode.props.value ?? {}"
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
            page.contents.value.elements,
          )
        }
      "
    />
  </TSidebar>

  <!-- <BoundingBox v-if="editedNode.bbox.value" v-bind="editedNode.bbox.value" /> -->
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
import TSidebar from './TSidebar.vue'
import { computed, ref, watch } from 'vue'

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const page = usePage(component.template!)

const editedNode = useNode(page.contents, dictionnary)

const windowSize = useWindowSize()

const componentPanel = useComponentPanel()

const sidebarIsOpen = ref(false)

const shouldOpenSidebar = computed(() => {
  return Boolean(editedNode.editable.value && editedNode.schema.value?.props)
})

watch(shouldOpenSidebar, () => {
  sidebarIsOpen.value = true
})

function onSidebarClose() {
  sidebarIsOpen.value = false
  editedNode.node.value = null
}
</script>

<style>
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
