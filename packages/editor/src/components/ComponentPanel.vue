<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents @select="(data) => emit('select', data)" />
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import type { TransientComponentSchema } from '@transient/ir'
import EditorComponents from './EditorComponents.vue'

const emit = defineEmits<(
    e: 'select',
    data: {
      schema: TransientComponentSchema
    },) => void>()
</script>
