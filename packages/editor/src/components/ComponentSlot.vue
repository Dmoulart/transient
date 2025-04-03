<template>
  <div
    class="flex aspect-square items-center justify-center rounded-lg font-bold hover:scale-300 transition-transform duration-300 ease-in-out"
    :style="{ 'font-size': '100%' }"
    @click="$emit('append', name)"
  >
    +
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
