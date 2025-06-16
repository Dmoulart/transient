<script setup lang="ts">
import { onMounted, h, shallowRef, createCommentVNode, watch } from 'vue'
import type {
  TransientElement,
  TransientComponentDictionnary,
  TransientTemplate,
} from 'transient/src/transient/definition'
import { loadAllComponents } from '@/lib/use-dictionnary'
import { findElementById, getTextValue, hasTextChildren } from 'transient/src/transient/ast'

const props = defineProps<{
  template: TransientTemplate
  registry: TransientComponentDictionnary
}>()

watch(
  () => props.template,
  () => {
    console.log('template changed')
  },
)

const loadedComponents = shallowRef<Record<string, any>>({})

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

function render(element: TransientElement) {
  if (element.tag === '#text') {
    return [
      createCommentVNode(`#text data-transient-id=${element.id}`, true),
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
      contenteditable: hasTextChildren(element) ? true : null,
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
        const matching = findElementById(props.template?.elements ?? [], id)
      }
    }
  })
})
</script>

<template>
  <component
    v-if="loadedComponents"
    v-for="el in props.template?.elements || []"
    :is="render(el)"
  />
  <div v-else>Loading...</div>
</template>
<style></style>
