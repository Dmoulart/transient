<template>
  <div
    class="flex aspect-square items-center justify-center rounded-lg font-bold hover:scale-300 transition-transform duration-300 ease-in-out"
    :style="{ 'font-size': '100%', height: '100%', 'aspect-ratio': '1 / 1', padding: '4px' }"
    @click="$emit('append', name)"
  >
    +
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
