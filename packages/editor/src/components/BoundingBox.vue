<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="absolute stroke-teal-700 fill-transparent"
    :style="{
      top,
      left,
    }"
  >
    <rect
      x="0"
      y="0"
      :width="width"
      :height="height"
      :rx="borderRadius"
      :ry="borderRadius"
      :stroke-width="strokeWidth"
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
  { borderRadius: 0, strokeWidth: 4 },
)
</script>
