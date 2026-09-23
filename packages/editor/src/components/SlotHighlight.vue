<template>
  <UseBoundingBox :node="node" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox">
      <button
        title="Insert after"
        class="pointer-events-auto absolute inset-1/2 z-10 flex size-6 items-center justify-center rounded-full bg-teal-500 text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-teal-400"
        @click="emit('insert-component', { targetNodeID: id() })"
      >
        <Plus class="size-4" :stroke-width="2.5" />
      </button>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import { assertIsDefined, getTransientID } from 'transient'
import { Plus } from 'lucide-vue-next'
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'
import type { EditorEvents } from '@/editor/events'

const props = defineProps<{ node: HTMLElement }>()
const emit = defineEmits<EditorEvents>()

function id() {
  const id = getTransientID(props.node)
  assertIsDefined(id)
  return id
}
</script>
