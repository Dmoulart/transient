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
      '--richtext-editor-bottom': selection.text.bbox.value
        ? `${windowSize.height.value - selection.text.bbox.value.top}px`
        : undefined,
      '--richtext-editor-left': selection.text.bbox.value
        ? `${selection.text.bbox.value.left ?? 0}px`
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
          selection.selected.node.value = selectedNode
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
  <div>selected.component : {{ selection.component.element.value?.tag }}</div>
  <!-- <BoundingBox v-if="editedNode.bbox.value" v-bind="editedNode.bbox.value" /> -->
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useComponentPanel } from '@/lib/use-node.js'
import RichTextEditor from './RichTextEditor.vue'
import { useWindowSize, whenever } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import TDrawer from './TDrawer.vue'
import { computed, ref, shallowRef } from 'vue'
import { useSelection } from '@/lib/use-selection.js'

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const page = usePage(component.template!)

const selection = useSelection(shallowRef(null), page.contents, dictionnary)

const windowSize = useWindowSize()

const componentPanel = useComponentPanel()

const sidebarIsOpen = ref(false)

const shouldOpenSidebar = computed(() => {
  return Boolean(selection.component.editable.value && selection.component.schema.value?.props)
})

whenever(shouldOpenSidebar, () => {
  sidebarIsOpen.value = true
})

function onSidebarClose() {
  sidebarIsOpen.value = false
  selection.selected.node.value = null
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
