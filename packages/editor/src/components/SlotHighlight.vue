<template>
  <UseBoundingBox :targets="targets" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox" variant="slot">
      <span
        v-if="empty"
        class="z-10 absolute top-1 left-1 text-[10px] leading-none font-medium tracking-wide text-amber-600/80 uppercase"
      >
        {{ slotName }}
      </span>
      <!-- empty slot: the box is the only way in -->
      <button
        v-if="empty"
        title="Insert here"
        class="pointer-events-auto absolute top-1/2 left-1/2 z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-amber-400"
        @click="emit('insert-component', { targetID: ownerId })"
      >
        <Plus class="size-4" :stroke-width="2.5" />
      </button>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'
import { watchEffect } from 'vue'

const props = defineProps<{ slotName: string; ownerId: string; targets: Node[]; empty: boolean }>()
const emit = defineEmits<{ 'insert-component': [data: { targetID: string }] }>()

watchEffect(() => console.log('targets', props.targets))
</script>
