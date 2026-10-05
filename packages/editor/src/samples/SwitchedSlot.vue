<template>
  <div class="rounded-xl border border-white/20 p-4">
    <p class="mb-2 font-mono text-xs tracking-wider text-white/60 uppercase">
      SwitchedSlot · state={{ state }}
    </p>
    <div class="rounded-md p-3 outline-1 outline-white/35 outline-dashed">
      <slot v-if="state === 'loading'" name="loading" />
      <slot v-else-if="state === 'empty'" name="empty" />
      <slot v-else name="ready" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ state?: 'loading' | 'empty' | 'ready' }>(), { state: 'ready' })
</script>
