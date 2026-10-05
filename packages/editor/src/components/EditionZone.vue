<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox" variant="editing">
      <span
        class="absolute top-[-4px] left-[-4px] -translate-y-full rounded-t-md bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium text-[#0C1222]"
      >
        ✎ {{ slotName ? `#${slotName}` : 'text' }}
      </span>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'

defineProps<{ targets: Node[]; slotName?: string }>()
</script>
