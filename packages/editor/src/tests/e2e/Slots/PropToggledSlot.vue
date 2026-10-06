<template>
  <section class="rounded-xl border border-white/20 p-4">
    <p class="mb-2 font-mono text-xs tracking-wider text-white/60 uppercase">
      PropToggledSlot · showHeader={{ showHeader }} · showFooter={{ showFooter }}
    </p>
    <h3
      v-if="showHeader"
      class="mb-2 rounded-md p-3 text-lg font-semibold outline-1 outline-white/35 outline-dashed"
    >
      <slot name="header" />
    </h3>
    <div class="rounded-md p-3 outline-1 outline-white/35 outline-dashed"><slot /></div>
    <footer
      v-if="showFooter"
      class="mt-2 rounded-md p-3 text-sm text-white/75 outline-1 outline-white/35 outline-dashed"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ showHeader?: boolean; showFooter?: boolean }>(), {
  showHeader: true,
  showFooter: false,
})
</script>
