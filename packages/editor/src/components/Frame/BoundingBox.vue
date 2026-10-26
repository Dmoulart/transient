<template>
  <component
    :is="as ?? 'div'"
    :style="{
      top: `${bbox.top.value}px`,
      left: `${bbox.left.value}px`,
      width: `${bbox.width.value}px`,
      height: `${bbox.height.value}px`,
      'border-radius': bbox.borderRadius.value ?? undefined,
    }"
  >
    <slot />
  </component>
</template>
<script setup lang="ts">
import type { useElementsBounding } from '@/lib/composables/use-bounding-box'

defineProps<{
  bbox: ReturnType<typeof useElementsBounding>
  as?: string
}>()
</script>
