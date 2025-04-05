<template>
  <ComponentView selectable :prototype="prototype" @append="emit('append', $event)" />
</template>
<script setup lang="ts">
import type { Prototype } from '@/stores/use-prototype'

const emit = defineEmits<{ (e: 'append', data: { slot: string; path: string; to: Prototype }): void }>()

defineProps<{
  prototype: Prototype
}>()
</script>
