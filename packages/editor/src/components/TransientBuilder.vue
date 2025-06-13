<script setup lang="ts">
import { onMounted, ref, h, shallowRef } from 'vue'
import { loadAllComponents } from '@/stores/use-prototype'
import type {
  TransientElement,
  TransientComponentSchema,
  TransientComponentDictionnary,
} from 'transient/src/transient/definition'

const props = defineProps<{
  schema: TransientComponentSchema
  schemaDict: TransientComponentDictionnary
}>()

const loadedComponents = shallowRef<Record<string, any>>({})

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

function renderElement(element: TransientElement): any {
  if (element.tag === '#text') {
    return element.attributes?.value?.expression
  }

  if (element.tag === 'template') {
    console.log({ element })
    // Handle <template #slotName>
    const slotName = element.attributes?.name?.expression || 'default'
    const children = (element.slots?.default || []).map(renderElement)
    return {
      slotName,
      render: () => children,
    }
  }

  const isComponent = element.isComponent
  const tag = element.tag
  const Component = isComponent ? loadedComponents.value[tag] || tag : tag

  const attrs = Object.fromEntries(
    Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
  )

  const slots: Record<string, () => any> = {}

  for (const [slotName, slotElements] of Object.entries(element.slots || {})) {
    const rendered = slotElements.map(renderElement)
    const hasWrappedTemplateSlot = rendered.every((r) => typeof r === 'object' && 'slotName' in r)
    if (hasWrappedTemplateSlot) {
      for (const slot of rendered as { slotName: string; render: () => any }[]) {
        slots[slot.slotName] = slot.render
      }
    } else {
      slots[slotName] = () => rendered
    }
  }

  return h(Component, attrs, slots)
}
</script>

<template>
  <component
    class="c"
    v-if="loadedComponents"
    v-for="el in props.schema.template?.elements || []"
    :is="renderElement(el)"
  />
  <div v-else>Chargement des composants...</div>
</template>
<style></style>
