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
      aria-hidden="true"
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
        :class="[style.fill, style.stroke]"
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
import { computed } from 'vue'
import type { useElementsBounding } from '@/lib/composables/use-bounding-box'

// a slot box is drawn inside the component box: with equal geometry (a component that is
// only a slot) both must stay visible, hence the inset.
const variants = {
  component: {
    stroke: 'stroke-teal-500',
    fill: 'fill-transparent',
    strokeWidth: 2,
    inset: -4,
    dash: undefined as string | undefined,
    halo: true,
    handles: true,
    shadow: 'drop-shadow(0 1px 3px rgb(0 0 0 / 0.35))',
  },
  // available slot: quiet, static
  slot: {
    stroke: 'stroke-amber-500/50',
    fill: 'fill-transparent',
    strokeWidth: 1,
    inset: -1,
    dash: '4 3',
    halo: false,
    handles: false,
    shadow: undefined,
  },
  // slot being typed in: solid, tinted, focus-ring glow
  editing: {
    stroke: 'stroke-amber-400',
    fill: 'fill-amber-400/[0.06]',
    strokeWidth: 2,
    inset: -3,
    dash: undefined,
    halo: false,
    handles: false,
    shadow: 'drop-shadow(0 0 4px rgb(251 191 36 / 0.45))',
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
