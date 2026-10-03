<template>
  <div>{{ count }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const count = ref(0)
onMounted(() => {
  setInterval(() => (count.value += 1), 1000)
})
</script>
