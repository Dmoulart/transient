<template>
  <div class="overflow-y-scroll p-2">
    <div class="w-full">
      <div v-if="dictionnary" class="space-y-1 flex flex-row overflow-hidden flex-wrap gap-5">
        <ComponentItem
          v-for="(schema, path, index) in dictionnary"
          :schema="schema"
          :path="path as string"
          :key="index"
          @click="$emit('select', path)"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type TransientComponentDictionnary } from 'transient'
defineProps<{ dictionnary: TransientComponentDictionnary }>()
</script>
