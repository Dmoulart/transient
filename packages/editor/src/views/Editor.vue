<template>
  <EditorLayout />
</template>
<script setup lang="ts">
import EditorLayout from '../components/EditorLayout.vue'
import { ref } from 'vue'
const schemas = ref()
fetch('http://127.0.0.1:3001/schemas')
  .then((schemas) => schemas.json())
  .then((s) => {
    schemas.value = s
  })
</script>
<style lang="scss"></style>
