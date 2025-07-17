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

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = defineProps()

const isCollapsed = ref(false)
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style>
/* Optional: Smooth icon transitions */
svg {
  transition: transform 0.2s ease;
}
</style>
