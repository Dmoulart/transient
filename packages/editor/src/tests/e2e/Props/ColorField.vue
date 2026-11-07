<!-- a custom field: gets the same props as PropField, emits update:modelValue -->
<template>
  <input
    type="color"
    data-field="color"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<script setup lang="ts">
import type { TransientProp } from '@transient/ir'

defineProps<{ prop: TransientProp; modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
