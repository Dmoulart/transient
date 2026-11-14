<!-- the slot shares its parent with a title: sibling selectors (`h2 + p`) only hold if
     editing adds no element around the slot (like atelier's Content block) -->
<template>
  <div class="titled-slot max-w-xs rounded-xl border border-white/20 p-4">
    <h2 class="text-xl font-semibold">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style>
.titled-slot p {
  text-align: justify;
}
.titled-slot h2 + p {
  margin-bottom: 2rem;
}
</style>
