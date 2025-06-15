<script setup lang="ts">
import { onMounted, h, shallowRef, createCommentVNode } from 'vue'
import type {
  TransientElement,
  TransientComponentSchema,
  TransientComponentDictionnary,
} from 'transient/src/transient/definition'
import { loadAllComponents } from '@/stores/use-dictionnary'
import { findElementById, hasTextChildren } from 'transient/src/transient/ast'
import { htmlNodeToTransientElement } from 'transient/src/analyzers/html/html'

const props = defineProps<{
  schema: TransientComponentSchema
  registry: TransientComponentDictionnary
}>()

const loadedComponents = shallowRef<Record<string, any>>({})

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

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

onMounted(() => {
  const root = document.querySelector('[data-transient-id]')

  if (root) {
    const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'characterData') {
          if (mutation.oldValue === mutation.target.textContent) {
            continue
          }

          const textNode = mutation.target

          if (textNode.nodeType === Node.TEXT_NODE) {
            onTextChange(textNode)
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

function onTextChange(textNode: Node) {
  // le précédent est le commentaire
  const prev = textNode.previousSibling

  if (prev && prev.nodeType === Node.COMMENT_NODE) {
    // extraire l'ID depuis le commentaire
    const match = prev.nodeValue!.match(/#text data-transient-id=(\d+)/)

    if (match) {
      const id = match[1]

      const newElement = htmlNodeToTransientElement(textNode, id)

      emit('replace', newElement)
    }
  }
}

const emit = defineEmits<{
  replace: [newElement: TransientElement]
}>()
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
