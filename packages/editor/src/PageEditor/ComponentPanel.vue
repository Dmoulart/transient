<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents @select="(data) => emit('select', data)" />
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import EditorComponents from './EditorComponents.vue'
import { useComponentPanel } from '@/lib/use-edition'
import type { TransientComponentSchema } from 'transient/src/transient/definition'

const emit = defineEmits<{
  (
    e: 'select',
    data: {
      schema: TransientComponentSchema
    },
  ): void
}>()
</script>
