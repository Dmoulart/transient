<template>
  <slot :bbox="bbox"></slot>
</template>
<script setup lang="ts">
import { useBoundingBox } from '@/lib/use-bounding-box'

const props = defineProps<{ node: HTMLElement }>()

const bbox = useBoundingBox(() => props.node)
</script>
