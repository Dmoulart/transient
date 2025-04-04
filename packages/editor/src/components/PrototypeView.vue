<template>
  <ComponentView
    :path="path"
    :schema="schema"
    :data="data"
    :slots="slots"
    @append="emit('append', $event)"
  />
</template>
<script setup lang="ts">
import type { TransientComponentSchema } from 'transient'

const emit = defineEmits<{ (e: 'append', data: { slot: string; path: string }): void }>()

defineProps<{
  data: Record<string, any>
  slots: Record<string, string[]>
  path: string
  schema: TransientComponentSchema
}>()
</script>
