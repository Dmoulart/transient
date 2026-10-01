<template>
  <slot :bbox="bbox"></slot>
</template>
<script setup lang="ts">
import { useElementsBounding, type MaybeNode } from '@/lib/composables/use-bounding-box'

const props = defineProps<{ targets: MaybeNode[] }>()

const bbox = useElementsBounding(() => props.targets)
</script>
