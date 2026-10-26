<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox
      as="fieldset"
      :bbox="bbox"
      class="tr-frame-slot-editing"
      :class="{ '!tr-border-dashed tr-animate-fade-in': hover }"
    >
      <legend data-test="editing-frame" :data-slot-name="slotName" class="tr-slot-label">
        <span class="tr-slot-label-text">✎ {{ slotName ? `#${slotName}` : 'text' }}</span>
      </legend>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'

defineProps<{ targets: Node[]; slotName?: string; hover?: boolean }>()
</script>
