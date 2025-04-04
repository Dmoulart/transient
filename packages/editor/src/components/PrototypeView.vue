<template>
  <ComponentView :path="path" :data="data" :slots="slots" @append="emit('append', $event)" />
</template>
<script setup lang="ts">
const emit = defineEmits<{ (e: 'append', data: { slot: string; path: string }): void }>()

defineProps<{
  data: Record<string, any>
  slots: Record<string, string[]>
  path: string
}>()
</script>
