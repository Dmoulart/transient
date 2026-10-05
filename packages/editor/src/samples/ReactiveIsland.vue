<template>
  <span class="rounded bg-white px-1.5 font-mono text-sm text-[#0C1222] tabular-nums">{{
    count
  }}</span>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const count = ref(0)
let timer: ReturnType<typeof setInterval>
onMounted(() => (timer = setInterval(() => count.value++, 1000)))
onUnmounted(() => clearInterval(timer))
</script>
