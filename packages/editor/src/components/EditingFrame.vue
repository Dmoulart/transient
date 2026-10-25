<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox" variant="editing">
      <span
        data-test="editing-frame"
        :data-slot-name="slotName"
        class="tr-absolute tr-top-[-4px] tr-left-[-4px] tr--translate-y-full tr-rounded-t-md tr-bg-amber-400 tr-px-1.5 tr-py-0.5 tr-font-mono tr-text-[10px] tr-leading-none tr-font-medium tr-text-[#0C1222]"
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
