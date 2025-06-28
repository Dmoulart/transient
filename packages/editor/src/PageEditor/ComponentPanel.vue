<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents @select="(data) => $emit('select', data)" />
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import EditorComponents from './EditorComponents.vue'

const registry = useDictionnary()
</script>
