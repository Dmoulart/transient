<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox
      :bbox="bbox"
      :class="hover ? 'tr-frame-hover tr-animate-fade-in' : 'tr-frame-slot'"
    >
      <span
        v-if="empty"
        class="tr-z-10 tr-absolute tr-top-1 tr-left-1 tr-text-[10px] tr-leading-none tr-font-medium tr-tracking-wide tr-text-amber-600/80 tr-uppercase"
      >
        {{ slotName }}
      </span>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import BoundingBox from './Frame/BoundingBox.vue'
import UseBoundingBox from './Frame/UseBoundingBox.vue'

defineProps<{
  slotName: string
  ownerId: string
  targets: Node[]
  empty: boolean
  hover?: boolean
}>()
</script>
