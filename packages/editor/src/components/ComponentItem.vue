<template>
  <article class="w-30 h-30 flex flex-col gap-1 cursor-pointer border rounded-md select-none p-2">
    <ComponentView class="select-none pointer-events-none" :prototype="prototype" />
    <footer class="truncate">{{ name }}</footer>
  </article>
</template>

<script setup lang="ts">
import { type TransientComponentSchema } from 'transient'
import ComponentView from './ComponentView.vue'
import { getPrototypeName, type Prototype } from '@/stores/use-prototype'

const props = defineProps<{ prototype: Prototype }>()
const name = getPrototypeName(props.prototype.path)
</script>

<style></style>
