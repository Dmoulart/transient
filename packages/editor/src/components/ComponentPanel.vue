<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents @select="(data) => emit('select', data)" :dictionnary="dictionnary"/>
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import type { TransientComponentDictionnary, TransientComponentSchema } from '@transient/ir'
import EditorComponents from './EditorComponents.vue'

defineProps<{dictionnary: TransientComponentDictionnary}>()
const emit = defineEmits<(
    e: 'select',
    data: {
      schema: TransientComponentSchema
    },) => void>()
</script>
