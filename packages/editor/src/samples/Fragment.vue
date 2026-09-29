<template>
  <div>1</div>
  <div>2</div>
  <div v-if="count">{{ count }}</div>
  <slot>FRAGMENT</slot>
</template>
<script setup lang="ts">
defineProps<{
  count?: number
}>()
</script>
