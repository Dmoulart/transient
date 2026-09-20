<template>
  <svg
    class="pointer-events-none fixed overflow-visible stroke-teal-700 fill-transparent"
    :style="{ top: `${top}px`, left: `${left}px` }"
    :width="width"
    :height="height"
  >
    <rect
      class="ants"
      :x="strokeWidth / 2"
      :y="strokeWidth / 2"
      :width="width - strokeWidth"
      :height="height - strokeWidth"
      :rx="borderRadius"
      :stroke-width="strokeWidth"
      stroke-dasharray="4 2"
    />
  </svg>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    top: number
    left: number
    height: number
    width: number
    borderRadius?: number
    strokeWidth?: number
  }>(),
  { borderRadius: 0, strokeWidth: 3 },
)
</script>
<style scoped>
.ants {
  animation: ants 0.5s linear infinite;
}
@keyframes ants {
  to {
    stroke-dashoffset: -6; /* = dash + gap */
  }
}
</style>
