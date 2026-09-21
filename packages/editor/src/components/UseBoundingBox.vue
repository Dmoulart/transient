<template>
  <slot :bbox="bbox"></slot>
</template>
<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{
  node: HTMLElement
}>()

const node = computed(() => {
  return props.node
})

const bbox = useElementBounding(node, {
  windowResize: true,
  immediate: true,
  windowScroll: true,
})
</script>
