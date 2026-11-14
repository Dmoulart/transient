<!-- a sibling of the slot comes and goes on its own: the component wants to re-render
     while the slot is being edited -->
<template>
  <div class="rounded-xl border border-white/20 p-4">
    <slot />
    <p v-if="on" data-test="blink" class="text-white/60">blink</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const on = ref(true)
let timer: ReturnType<typeof setInterval>
onMounted(() => (timer = setInterval(() => (on.value = !on.value), 150)))
onUnmounted(() => clearInterval(timer))
</script>
