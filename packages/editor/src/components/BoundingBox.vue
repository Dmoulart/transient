<template>
  <div
    class="pointer-events-none fixed overflow-visible"
    :style="{
      top: `${bbox.top.value}px`,
      left: `${bbox.left.value}px`,
    }"
  >
    <slot />
    <svg
      :style="{
        filter: 'drop-shadow(0 1px 3px rgb(0 0 0 / 0.35))',
      }"
      :width="bbox.width.value"
      :height="bbox.height.value"
    >
      <!-- halo: keeps the outline readable on dark / busy backgrounds -->
      <rect v-bind="frame" class="fill-transparent stroke-white" :stroke-width="strokeWidth + 2" />
      <rect v-bind="frame" class="fill-transparent stroke-teal-500" :stroke-width="strokeWidth" />
      <rect
        v-for="([x, y], i) in corners"
        :key="i"
        :x="x - handle / 2"
        :y="y - handle / 2"
        :width="handle"
        :height="handle"
        rx="1.5"
        class="fill-white stroke-teal-500"
        stroke-width="1.5"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { useBoundingBox } from '@/lib/use-bounding-box'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    bbox: ReturnType<typeof useBoundingBox>
    borderRadius?: number
    strokeWidth?: number
  }>(),
  { borderRadius: 0, strokeWidth: 2 },
)

const handle = 8

const frame = computed(() => ({
  x: props.strokeWidth / 2,
  y: props.strokeWidth / 2,
  width: Math.max(0, props.bbox.width.value - props.strokeWidth),
  height: Math.max(0, props.bbox.height.value - props.strokeWidth),
  rx: props.borderRadius,
}))

const corners = computed(() => {
  const { x, y, width, height } = frame.value
  return [
    [x, y],
    [x + width, y],
    [x, y + height],
    [x + width, y + height],
  ]
})
</script>
