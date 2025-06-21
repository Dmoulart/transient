<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content>
      <EditorComponents />
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import { useRegistry } from '@/lib/use-dictionnary'
import EditorComponent from './EditorComponent.vue'
import EditorComponents from './EditorComponents.vue'

const registry = useRegistry()
</script>
