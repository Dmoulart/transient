<template>
  <div
    class="flex items-center justify-centerfont-bold hover:scale-300 transition-transform duration-300 ease-in-out"
  >
    {{ name }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
