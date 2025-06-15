<script setup lang="ts">
import { onMounted, h, shallowRef, nextTick } from 'vue'
import type {
  TransientElement,
  TransientComponentSchema,
  TransientComponentDictionnary,
} from 'transient/src/transient/definition'
import { loadAllComponents } from '@/stores/use-dictionnary'
import { findElementById, hasTextChildren, replaceElement } from 'transient/src/transient/ast'
import { htmlNodeToTransientElement } from 'transient/src/analyzers/html/html'
import { useTextSelection } from '@vueuse/core'

const props = defineProps<{
  schema: TransientComponentSchema
  schemaDict: TransientComponentDictionnary
}>()

const loadedComponents = shallowRef<Record<string, any>>({})

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

const selection = useTextSelection()

function render(element: TransientElement): any {
  if (element.tag === '#text') {
    return element.attributes?.value?.expression
  }

  const isComponent = element.isComponent
  const tag = element.tag
  const Component = isComponent ? loadedComponents.value[tag] || tag : tag

  const attrs = Object.fromEntries(
    Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
  )

  const slots: Record<string, () => any> = {}

  for (const [slotName, slotElements] of Object.entries(element.slots || {})) {
    const rendered = slotElements.map(render)
    slots[slotName] = () => rendered
  }

  const meta: Record<string, any> = {}
  for (const [key, value] of Object.entries(element.attributes)) {
    meta[`data-transient-attr-${key}`] = JSON.stringify(value)
  }

  return h(
    Component,
    {
      ...attrs,
      ...meta,
      contenteditable: hasTextChildren(element),
      'data-transient-id': element.id,
    },
    slots,
  )
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('[data-transient-id]')
    console.log(selection)

    if (item && item instanceof HTMLElement) {
      const id = item.dataset.transientId
      if (id) {
        const matching = findElementById(props.schema.template?.elements ?? [], Number(id))
        console.log('Élément correspondant :', matching)
      }
    }
  })
})

onMounted(() => {
  const root = document.querySelector('[data-transient-id]')

  if (root) {
    const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'characterData') {
          const parent = mutation.target.parentElement
          console.log({ mutation })
          if (parent && parent.dataset.transientId) {
            syncElement(parent)
          }
        }
      }
    })

    observer.observe(root, {
      characterData: true,
      subtree: true,
      characterDataOldValue: true,
    })
  }
})

function syncElement(parent: HTMLElement) {
  if (!parent.dataset.transientId) {
    throw new Error(
      'Expected HTML element to have a data-transient-id attribute before replacing it',
    )
  }
  const newElement = htmlNodeToTransientElement(parent, Number(parent.dataset.transientId))
  replaceElement(props.schema.template?.elements ?? [], newElement)
}

// function syncElementSlots(parent: HTMLElement) {
//   if (!parent.dataset.transientId) {
//     throw new Error(
//       'Expected HTML element to have a data-transient-id attribute before replacing it',
//     )
//   }
//   const newElement = htmlNodeToTransientElement(parent.childNodes.item(0)!, Number(parent.dataset.transientId) + 1)
//   replaceElement(props.schema.template?.elements ?? [], newElement)
// }

function restoreSelectionRange(range: Range | null): void {
  if (range) {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}
</script>

<template>
  <component
    v-if="loadedComponents"
    v-for="el in props.schema.template?.elements || []"
    :is="render(el)"
  />
  <div v-else>Loading...</div>
</template>
<style></style>
