<template>
  <article class="w-30 h-30 flex flex-col gap-1 cursor-pointer border rounded-md select-none p-2">
    <ComponentView
      class="select-none pointer-events-none"
      :path="path"
      :schema="schema"
      :slots="{}"
    />
    <footer class="truncate">{{ name }}</footer>
  </article>
</template>

<script setup lang="ts">
import { type TransientComponentSchema } from 'transient'
import ComponentView from './ComponentView.vue'

const props = defineProps<{ path: string; schema: TransientComponentSchema }>()
const name = props.path.split('/').at(-1)
</script>

<style></style>
