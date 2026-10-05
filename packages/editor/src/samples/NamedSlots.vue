<template>
  <section class="rounded-xl border border-white/20 p-4">
    <p class="mb-2 font-mono text-xs tracking-wider text-white/60 uppercase">NamedSlots</p>
    <h3 class="rounded-md p-3 text-lg font-semibold outline-1 outline-white/35 outline-dashed">
      <slot name="header" />
    </h3>
    <div class="my-2 rounded-md p-3 outline-1 outline-white/35 outline-dashed"><slot /></div>
    <footer class="rounded-md p-3 text-sm text-white/75 outline-1 outline-white/35 outline-dashed">
      <slot name="footer" />
    </footer>
  </section>
</template>
