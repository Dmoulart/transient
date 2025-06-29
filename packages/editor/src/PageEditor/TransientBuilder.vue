<script setup lang="ts">
import { onMounted, h, shallowRef, createCommentVNode, watch } from 'vue'
import type { TransientElement, TransientTemplate } from 'transient/src/transient/definition'
import { loadAllComponents } from '@/lib/use-dictionnary'
import { findElementById, hasTextChildren } from 'transient/src/transient/ast'
import { isElementEditable } from '@/lib/use-edition'

const props = defineProps<{
  template: TransientTemplate
}>()

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
  // if (isComponent) {
  //   const schema = getTransientComponentSchemaByTag(tag)
  //   console.log({ schema })
  // }
  const Component = isComponent ? loadedComponents.value[tag] || tag : tag

  const attrs = Object.fromEntries(
    Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
  )

  const slots: Record<string, () => any> = {}

  const rendered = (element.children ?? []).map(render)
  slots.default = () => rendered

  const meta: Record<string, any> = {}
  for (const [key, value] of Object.entries(element.attributes)) {
    meta[`data-transient-attr-${key}`] = JSON.stringify(value)
  }

  const listeners: Record<string, (e: Event) => void> = {}

  // if (isElementEditable(element)) {
  //   listeners.selectionchange = detectElementEdition
  // }

  return h(
    Component,
    {
      ...attrs,
      ...meta,
      ...listeners,
      'data-transient-editable': isElementEditable(element),
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
