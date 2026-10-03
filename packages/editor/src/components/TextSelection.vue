<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox" variant="slot"> </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'

defineProps<{ targets: Node[] }>()
</script>
<style>
/* [contenteditable='true'] {
  outline: none;
} */
</style>
