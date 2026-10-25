<template>
  <div data-test="tile" class="rounded-md border border-white/20 px-4 py-3">{{ label }}</div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Tile' })
</script>
