<template>
  <UseBoundingBox :targets="root" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox">
      <div class="tr-z-10 tr-absolute tr-bottom-full tr-left-0 tr-gap-2 tr-flex">
        <span
          data-test="selection"
          :data-tag="element.tag"
          class="tr-rounded-t-sm tr-bg-teal-500 tr-px-1.5 tr-py-0.5 tr-text-[10px] tr-leading-none tr-font-semibold tr-tracking-wide tr-text-white tr-uppercase"
        >
          {{ label }}
        </span>
        <EditButton
          data-action="insert-after"
          title="Delete"
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

      <button
        type="button"
        data-action="insert-after"
        title="Insert after"
        class="tr-pointer-events-auto tr-absolute tr-top-full tr-left-1/2 tr-z-10 tr-flex tr-size-6 tr--translate-x-1/2 tr--translate-y-1/2 tr-items-center tr-justify-center tr-rounded-full tr-bg-teal-500 tr-text-white tr-shadow-md tr-ring-2 tr-ring-white tr-transition tr-hover:scale-110 tr-hover:bg-teal-400"
        @click="emit('insert-component', { targetID: element.id })"
      >
        <Plus class="tr-size-4" :stroke-width="2.5" />
      </button>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import type { TransientElement } from '@transient/ir'
import { Plus, Trash } from 'lucide-vue-next'
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
