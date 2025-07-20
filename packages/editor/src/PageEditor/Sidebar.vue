<template>
  <aside
    :class="[
      'sidebar flex flex-col bg-gray-900 text-white h-screen transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <slot />
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{}>()

const isCollapsed = ref(false)
</script>

<style>
/* Optional: Smooth icon transitions */
svg {
  transition: transform 0.2s ease;
}
</style>
