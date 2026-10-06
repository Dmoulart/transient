<template>
  <div class="rounded-xl border border-white/20 p-4">
    <p class="mb-2 font-mono text-xs tracking-wider text-white/60 uppercase">
      RepeatedSlot · count={{ count }}
    </p>
    <ul class="flex flex-col gap-2">
      <li
        v-for="i in Number(count)"
        :key="i"
        class="rounded-md p-3 outline-1 outline-white/35 outline-dashed"
      >
        <slot />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 3 })
</script>
