<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox" :class="hover ? 'tr-frame-hover tr-animate-fade-in' : 'tr-frame-slot'">
      <span
        v-if="empty"
        class="z-10 absolute top-1 left-1 text-[10px] leading-none font-medium tracking-wide text-amber-600/80 uppercase"
      >
        {{ slotName }}
      </span>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import BoundingBox from './Frame/BoundingBox.vue'
import UseBoundingBox from './Frame/UseBoundingBox.vue'

defineProps<{ slotName: string; ownerId: string; targets: Node[]; empty: boolean; hover?: boolean }>()
</script>
