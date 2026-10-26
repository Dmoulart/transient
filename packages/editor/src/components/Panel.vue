<template>
  <aside class="tr-panel tr-gap-4 tr-max-h-[80dvh] tr-scroll-root tr-overflow-hidden">
    <header
      class="tr-scroll-shadow tr-shrink-0 tr-p-4 tr-pb-1 tr-bg-surface tr-sticky tr-top-0 tr-z-1 tr-flex tr-flex-row tr-justify-between tr-items-center"
    >
      <div class="tr-flex tr-flex-col tr-gap-2">
        <slot name="header" />
      </div>
      <button type="button" class="tr-icon-btn" aria-label="Fermer" @click="$emit('close')">
        <span class="tr-i-lucide-x" aria-hidden="true" />
      </button>
    </header>
    <div class="tr-scroll-body tr-min-h-0 tr-overflow-y-auto tr-flex tr-flex-col tr-gap-6 tr-pb-6 tr-px-4">
      <slot />
    </div>
  </aside>
</template>
