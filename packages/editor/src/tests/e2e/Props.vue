<script setup lang="ts">
import AllProps from './Props/AllProps.vue'
</script>

<template>
  <main class="min-h-screen bg-[#0C1222] text-white">
    <div class="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <AllProps required-text="Required" />
    </div>
  </main>
</template>
