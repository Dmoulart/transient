<script setup lang="ts">
import { onMounted, h, shallowRef } from 'vue'
import type {
  TransientElement,
  TransientComponentSchema,
  TransientComponentDictionnary,
} from 'transient/src/transient/definition'
import { loadAllComponents } from '@/stores/use-dictionnary'
import { findElementById } from '@/stores/use-editor'

const props = defineProps<{
  schema: TransientComponentSchema
  schemaDict: TransientComponentDictionnary
}>()

const loadedComponents = shallowRef<Record<string, any>>({})

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

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

  return h(
    Component,
    {
      ...attrs,
      'data-item-id': element.id, // <- attribut que tu peux récupérer ensuite
    },
    slots,
  )
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('[data-item-id]')
    if (item && item instanceof HTMLElement) {
      const id = item.dataset.itemId
      if (id) {
        const matching = findElementById(props.schema.template?.elements ?? [], Number(id))
        console.log('Élément correspondant :', matching)
      }
    }
  })
})
</script>

<template>
  <component
    v-if="loadedComponents"
    v-for="el in props.schema.template?.elements || []"
    :is="render(el)"
    contenteditable="true"
  />
  <div v-else>Chargement des composants...</div>
</template>
<style></style>
