<!-- text of the component right next to the slot: it can't be made read-only, so the
     slot is edited in a wrapper instead of in this <p> -->
<template>
  <p class="rounded-xl border border-white/20 p-4">Label: <slot /></p>
</template>
