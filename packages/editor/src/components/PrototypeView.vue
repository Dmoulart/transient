<template>
  <ComponentView
    :path="path"
    :schema="schema"
    :data="data"
    :slots="slots"
    @append="$emit('append', $event)"
  />
</template>
<script setup lang="ts">
import type { TransientComponentSchema } from 'transient'

defineProps<{
  data: Record<string, any>
  slots: Record<string, string[]>
  path: string
  schema: TransientComponentSchema
}>()
</script>
