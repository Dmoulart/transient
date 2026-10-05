<template>
  <div class="flex items-center gap-3 rounded-xl border border-white/20 p-4">
    <span v-if="$slots.icon" class="grid size-9 place-items-center rounded-full bg-white text-[#0C1222]">
      <slot name="icon" />
    </span>
    <div>
      <p class="font-mono text-xs tracking-wider text-white/60 uppercase">ConditionalSlot</p>
      <slot />
    </div>
  </div>
</template>
