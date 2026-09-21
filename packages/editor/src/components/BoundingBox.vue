<template>
  <svg
    class="pointer-events-none fixed overflow-visible"
    :style="{
      top: `${bbox.top.value}px`,
      left: `${bbox.left.value}px`,
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
</template>
<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    node: HTMLElement
    borderRadius?: number
    strokeWidth?: number
  }>(),
  { borderRadius: 0, strokeWidth: 2 },
)

const node = computed(() => {
  return props.node
})

const handle = 8

const bbox = useElementBounding(node, {
  windowResize: true,
  immediate: true,
  windowScroll: true,
})

const frame = computed(() => ({
  x: props.strokeWidth / 2,
  y: props.strokeWidth / 2,
  width: Math.max(0, bbox.width.value - props.strokeWidth),
  height: Math.max(0, bbox.height.value - props.strokeWidth),
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
