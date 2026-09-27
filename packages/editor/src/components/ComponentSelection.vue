<template>
  <UseBoundingBox :targets="root" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox">
      <span
        class="absolute bottom-full left-0 rounded-t-sm bg-teal-500 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-white uppercase"
      >
        {{ label }}
      </span>
      <!-- <RichTextEditor
        v-if="text"
        class="pointer-events-auto absolute bottom-full left-0 z-10 mb-4"
        :node="text"
        @delete="emit('edit', { type: 'delete-element', transientId: id() })"
        @insert-component="emit('insert-component', { targetNodeID: id() })"
      /> -->
      <button
        title="Insert after"
        class="pointer-events-auto absolute top-full left-1/2 z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-500 text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-teal-400"
        @click="emit('insert-component', { targetID: ir.key })"
      >
        <Plus class="size-4" :stroke-width="2.5" />
      </button>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { computed } from 'vue'
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'
import type { EditorEvents } from '@/editor/events'
import type { IrOpen } from '@/lib/ir/dom.ts'

const props = defineProps<{ root: HTMLElement[]; ir: IrOpen }>()
const emit = defineEmits<EditorEvents>()

// component name > slot name > tag
const label = computed(() => {
  return props.ir.name
  // const { transientComponent, transientSlot } = props.node.dataset
  // return transientComponent ?? transientSlot?.split(':')[0] ?? props.node.tagName.toLowerCase()
})
</script>
