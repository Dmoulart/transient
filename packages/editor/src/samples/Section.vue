<template>
  <section class="p-6 rounded-lg shadow-md" :style="{ 'min-width': '100%' }">
    <component v-if="title" :is="level" class="text-2xl font-semibold text-gray-800">
      {{ title }}
    </component>
    <slot />
    <footer v-if="$slots.footer" class="mt-4 border-t pt-4 text-gray-600">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ level: 'h1' | 'h2' | 'h3' | 'h4'; title?: string }>(), { level: 'h2' })
</script>
