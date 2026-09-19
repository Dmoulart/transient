<template>
  <UDrawer ref="drawer" v-bind="$attrs" class="max-w-125" direction="right" :overlay="false">
    <template #content><slot></slot> </template>
  </UDrawer>
</template>

<script setup lang="ts">
defineProps<{}>()
</script>
