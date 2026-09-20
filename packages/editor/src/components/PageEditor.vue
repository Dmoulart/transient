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

  <TDrawer class="sidebar" :open="sidebarIsOpen" @close="onSidebarClose">
    <div v-if="editedComponent.schema.value" class="flex flex-col gap-4">
      <h2>{{ editedComponent.element.value?.tag }}</h2>
      <ElementProps
        :props-schema="editedComponent.schema.value?.props"
        :values="editedComponent.props.value ?? {}"
        @update="
          ({ prop, value, propName }) => {
            console.log('update prop')
            applyEdition(
              {
                type: 'update-prop',
                propName,
                prop,
                value,
                transientId: editedComponent.element.value!.id,
              },
              page.contents.value.elements,
            )
          }
        "
      />
    </div>
  </TDrawer>

  <!-- <BoundingBox v-if="editedNode.bbox.value" v-bind="editedNode.bbox.value" /> -->
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useComponentPanel, useNode, useParentComponent } from '@/lib/use-edition'
import RichTextEditor from './RichTextEditor.vue'
import { useWindowSize, whenever } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import TDrawer from './TDrawer.vue'
import { computed, ref, shallowRef } from 'vue'

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const page = usePage(component.template!)

const editedNode = useNode(shallowRef(null), page.contents, dictionnary)

const editedComponent = useParentComponent(
  computed(() => editedNode.node.value),
  page.contents,
  dictionnary,
)
const windowSize = useWindowSize()

const componentPanel = useComponentPanel()

const sidebarIsOpen = ref(false)

const shouldOpenSidebar = computed(() => {
  return Boolean(editedComponent.editable.value && editedComponent.schema.value?.props)
})

whenever(shouldOpenSidebar, () => {
  sidebarIsOpen.value = true
})

function onSidebarClose() {
  sidebarIsOpen.value = false
  editedNode.node.value = null
}
</script>

<style>
.text-editor {
  position: fixed;
  bottom: var(--richtext-editor-bottom);
  left: var(--richtext-editor-left);
  z-index: 1000;
}
</style>
