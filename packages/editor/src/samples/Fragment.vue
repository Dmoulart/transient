<template>
  <div>1</div>
  <div>2</div>
  <div v-if="count">{{ count }}</div>
  <div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  count?: number
}>()
</script>
