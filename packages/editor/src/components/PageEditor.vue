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
  <UseBoundingBox
    v-if="selection.text.node.value"
    :node="selection.text.node.value"
    v-slot="{ bbox }"
  >
    <RichTextEditor
      :node="selection.text.node.value"
      :style="{
        bottom: `calc(100vh - ${bbox.top.value}px)`,
        left: `${bbox.left.value}px`,
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
  </UseBoundingBox>
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
  selected: {{ selection.selected.node.value && selection.selected.node.value.tagName }} text:
  {{ selection.text.node.value && selection.text.node.value.tagName }}
  <BoundingBox v-if="selection.selected.node.value" :node="selection.selected.node.value" />

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
import { useComponentPanel } from '@/lib/use-node.js'
import RichTextEditor from './RichTextEditor.vue'
import { useEventListener } from '@vueuse/core'
import ComponentPanel from './ComponentPanel.vue'
import { applyEdition } from '@/editor/edition'
import TransientBuilder from './TransientBuilder.vue'
import ElementProps from './ElementProps.vue'
import TDrawer from './TDrawer.vue'
import { shallowRef, useTemplateRef } from 'vue'
import { useSelection } from '@/lib/use-selection.js'
import { someHTMLElement } from 'transient'
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'

const canvas = useTemplateRef('canvas')

const dictionnary = useDictionnary()

const component = dictionnary.get('HomePage')

const page = usePage(component.template!)

const selection = useSelection(shallowRef(null), page.contents, dictionnary)

const componentPanel = useComponentPanel()

useEventListener(canvas, 'click', (ev: MouseEvent) => {
  // a click lands on the innermost element (a <strong> inside an editable <p>): resolve to the editable container
  selection.selected.node.value = someHTMLElement(ev.target)
    ? ev.target.closest<HTMLElement>('[data-transient-id], [data-transient-slot]')
    : null
})
</script>

<style>
.text-editor {
  position: fixed;
  z-index: 1000;
}
</style>
