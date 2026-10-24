<template>
  <UseBoundingBox :targets="root" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox">
      <div class="z-10 absolute bottom-full left-0 gap-2 flex">
        <span
          data-test="selection"
          :data-tag="element.tag"
          class="rounded-t-sm bg-teal-500 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-white uppercase"
        >
          {{ label }}
        </span>
        <EditButton
          @click="
            emit('edit', {
              type: 'delete-element',
              transientId: element.id,
            })
          "
        >
          <Trash :size="14" />
        </EditButton>
      </div>

      <!-- <RichTextEditor
        v-if="text"
        class="pointer-events-auto absolute bottom-full left-0 z-10 mb-4"
        :node="text"
        @delete="emit('edit', { type: 'delete-element', transientId: id() })"
        @insert-component="emit('insert-component', { targetNodeID: id() })"
      /> -->
      <button
        type="button"
        title="Insert after"
        class="pointer-events-auto absolute top-full left-1/2 z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-500 text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-teal-400"
        @click="emit('insert-component', { targetID: element.id })"
      >
        <Plus class="size-4" :stroke-width="2.5" />
      </button>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import { Plus, Trash } from 'lucide-vue-next'
import type { TransientElement } from '@transient/ir'
import { computed } from 'vue'
import type { EditorEvents } from '@/editor/events'
import BoundingBox from './BoundingBox.vue'
import EditButton from './EditButton.vue'
import UseBoundingBox from './UseBoundingBox.vue'

const props = defineProps<{ root: Node[]; element: TransientElement }>()
const emit = defineEmits<EditorEvents & { 'insert-component': [data: { targetID: string }] }>()

// component name > slot name > tag
const label = computed(() => {
  return props.element.tag
})
</script>
