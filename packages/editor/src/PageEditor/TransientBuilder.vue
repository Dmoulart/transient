<script setup lang="ts">
import { onMounted, h, shallowRef, createCommentVNode, watch } from 'vue'
import type {
  TransientElement,
  TransientComponentSchema,
  TransientComponentDictionnary,
} from 'transient/src/transient/definition'
import { loadAllComponents } from '@/stores/use-dictionnary'
import { findElementById, hasTextChildren, removeElement } from 'transient/src/transient/ast'
import {
  getElementTransientId,
  getTextNodeTransientId,
  getTransientID,
  htmlNodeToTransientElement,
} from 'transient/src/analyzers/html/html'
import { useEventListener } from '@vueuse/core'
import { useEditedNode } from '@/stores/use-edition'

const props = defineProps<{
  schema: TransientComponentSchema
  registry: TransientComponentDictionnary
}>()

const loadedComponents = shallowRef<Record<string, any>>({})

const emit = defineEmits<{
  replace: [newElement: TransientElement]
  remove: [id: string]
  append: [parentId: string, newElement: TransientElement]
}>()

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

const editedNode = useEditedNode()

function render(element: TransientElement): any {
  if (element.tag === '#text') {
    return [
      createCommentVNode(`#text data-transient-id=${element.id}`),
      element.attributes?.value?.expression,
    ]
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
    // console.log(selection)

    if (item && item instanceof HTMLElement) {
      const id = item.dataset.transientId
      if (id) {
        const matching = findElementById(props.schema.template?.elements ?? [], id)
      }
    }
  })
})

// onMounted(() => {
//   const root = document.querySelector('[data-transient-id]')

//   if (root) {
//     const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
//       for (const mutation of mutationsList) {
//         console.log({ mutation })
//         if (mutation.type === 'characterData') {
//           if (mutation.oldValue === mutation.target.textContent) {
//             continue
//           }

//           const textNode = mutation.target

//           if (textNode.nodeType === Node.TEXT_NODE) {
//             onTextChange(textNode)
//           }
//         } else if (mutation.type === 'childList') {
//           console.log('Enfant ajouté ou supprimé!', mutation)
//           for (const removedNode of mutation.removedNodes) {
//             const id = getTransientID(removedNode)
//             if (id) {
//               emit('remove', id)
//             }
//           }
//           for (const addedNode of mutation.addedNodes) {
//             console.log('Nœud ajouté!', { addedNode })

//             if (!addedNode.parentElement) {
//               throw new Error('Unknown parent')
//             }
//             const parentId = getTransientID(addedNode.parentElement as Node)

//             if (!parentId) {
//               throw new Error('Unknown parent ID')
//             }

//             const newElement = htmlNodeToTransientElement(addedNode, crypto.randomUUID())
//             emit('append', parentId, newElement)
//           }
//         }
//       }
//     })

//     observer.observe(root, {
//       characterData: true,
//       subtree: true,
//       characterDataOldValue: true,
//       childList: true,
//     })
//   }
// })

function onTextChange(textNode: Node) {
  const id = getTextNodeTransientId(textNode)
  console.log({ id })

  if (id) {
    const newElement = htmlNodeToTransientElement(textNode, id)

    emit('replace', newElement)
  } else {
    const newElement = htmlNodeToTransientElement(textNode, crypto.randomUUID())
    emit('append', getTransientID(textNode.parentElement as Node)!, newElement)
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
