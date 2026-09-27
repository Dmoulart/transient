<template>
  <div
    class="pointer-events-none fixed"
    :style="{
      top: `${bbox.top.value}px`,
      left: `${bbox.left.value}px`,
      width: `${bbox.width.value}px`,
      height: `${bbox.height.value}px`,
    }"
  >
    <slot />
    <svg
      class="absolute inset-0 overflow-visible"
      :style="{ filter: style.shadow }"
      :width="bbox.width.value"
      :height="bbox.height.value"
    >
      <!-- halo: keeps the outline readable on dark / busy backgrounds -->
      <rect
        v-if="style.halo"
        v-bind="frame"
        class="fill-transparent stroke-white"
        :stroke-width="style.strokeWidth + 2"
      />
      <rect
        v-bind="frame"
        class="fill-transparent"
        :class="[style.stroke, style.dash && 'ants']"
        :stroke-width="style.strokeWidth"
        :stroke-dasharray="style.dash"
      />
      <rect
        v-for="([x, y], i) in corners"
        :key="i"
        :x="x - handle / 2"
        :y="y - handle / 2"
        :width="handle"
        :height="handle"
        rx="1.5"
        class="fill-white"
        :class="style.stroke"
        stroke-width="1.5"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { useElementsBounding } from '@/lib/composables/use-bounding-box'
import { computed } from 'vue'

// a slot box is drawn inside the component box: with equal geometry (a component that is
// only a slot) both must stay visible, hence the inset.
const variants = {
  component: {
    stroke: 'stroke-teal-500',
    strokeWidth: 2,
    inset: 0,
    dash: undefined as string | undefined,
    halo: true,
    handles: true,
    shadow: 'drop-shadow(0 1px 3px rgb(0 0 0 / 0.35))',
  },
  slot: {
    stroke: 'stroke-amber-500',
    strokeWidth: 1.5,
    inset: 4,
    dash: '4 3',
    halo: false,
    handles: false,
    shadow: 'drop-shadow(0 0 2px rgb(255 255 255 / 0.9))',
  },
} as const

const props = withDefaults(
  defineProps<{
    bbox: ReturnType<typeof useElementsBounding>
    variant?: keyof typeof variants
    borderRadius?: number
  }>(),
  { borderRadius: 0, variant: 'component' },
)

const handle = 8

const style = computed(() => variants[props.variant])

const frame = computed(() => {
  const { strokeWidth, inset } = style.value
  const edge = inset + strokeWidth / 2
  return {
    x: edge,
    y: edge,
    width: Math.max(0, props.bbox.width.value - edge * 2),
    height: Math.max(0, props.bbox.height.value - edge * 2),
    rx: props.borderRadius,
  }
})

const corners = computed(() => {
  if (!style.value.handles) return []
  const { x, y, width, height } = frame.value
  return [
    [x, y],
    [x + width, y],
    [x, y + height],
    [x + width, y + height],
  ]
})
</script>
<style scoped>
.ants {
  animation: ants 1.4s linear infinite;
}
@keyframes ants {
  to {
    stroke-dashoffset: -7; /* = dash + gap */
  }
}
@media (prefers-reduced-motion: reduce) {
  .ants {
    animation: none;
  }
}
</style>
