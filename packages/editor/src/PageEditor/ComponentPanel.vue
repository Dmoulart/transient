<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents
        @select="
          (data) =>
            emit('add-component', {
              ...data,
              type: 'add-component',
              position: 'after',
              targetId: panel.targetNodeID.value!,
            })
        "
      />
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import type { AddComponentEdition } from '@/editor/edition'
import EditorComponents from './EditorComponents.vue'
import { useComponentPanel } from '@/lib/use-edition'

const emit = defineEmits<{
  (e: 'add-component', data: AddComponentEdition): void
}>()

const panel = useComponentPanel()
</script>
