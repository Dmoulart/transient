<script setup lang="ts">
import type { BindingValue, TransientComponentSchema, TransientElement, TransientProp } from '@transient/ir'

defineProps<{
  schema: TransientComponentSchema 
  instance: TransientElement 
}>()

defineEmits<{
  close: []
  update: [data: { prop: TransientProp; propName: string; value: BindingValue }]
}>()
</script>
<template>
    <aside>
        HELLO
    </aside>
</template>