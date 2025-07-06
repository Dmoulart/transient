<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents
        @select="
          (data) =>
            // emit('add-component', {
            //   ...data,
            //   type: 'add-component',
            //   position: 'after',
            //   targetId: panel.targetNodeID.value!,
            // })
            emit('edit', {
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
import type { AddComponentEdition, Edition } from '@/editor/edition'
import EditorComponents from './EditorComponents.vue'
import { useComponentPanel } from '@/lib/use-edition'

const emit = defineEmits<{
  (e: 'edit', data: Edition): void
}>()

const panel = useComponentPanel()
</script>
