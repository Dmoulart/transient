<template>
  <slot :bbox="bbox"></slot>
</template>
<script setup lang="ts">
import { useElementsBounding, type MaybeNode } from '@/lib/use-bounding-box'
import { watch } from 'vue'

const props = defineProps<{ targets: MaybeNode[] }>()

const bbox = useElementsBounding(() => props.targets)
watch(
  () => bbox,
  () => console.log('bbox changes ? '),
)
</script>
