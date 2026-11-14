<!-- three slots in one element: while one is edited, the others are siblings to leave alone -->
<template>
  <div class="rounded-xl border border-white/20 p-4">
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </div>
</template>
