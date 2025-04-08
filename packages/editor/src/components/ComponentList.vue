<template>
  <div class="overflow-y-scroll p-2">
    <div class="w-full">
      <div class="space-y-1 flex flex-row overflow-hidden flex-wrap gap-5">
        <ComponentItem
          v-for="(schema, path, index) in dictionnary"
          :prototype="createPrototype(path as string)"
          @select="$emit('select', path as string)"
          :draggable="draggable"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type TransientComponentDictionnary } from 'transient'
import ComponentItem from './ComponentItem.vue'
import { createPrototype } from '@/stores/use-prototype'
defineProps<{ dictionnary: TransientComponentDictionnary; draggable?: boolean }>()

defineEmits<{ (e: 'select', data: string): void }>()
</script>
