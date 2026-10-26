<template>
  <UseBoundingBox :targets="root" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox" class="tr-frame-selected">
      <div class="tr-tag-bar">
        <span data-test="selection" :data-tag="element.tag" class="tr-tag">
          {{ label }}
        </span>

        <button
          type="button"
          class="tr-tag-action"
          data-action="delete-element"
          title="Delete"
          @click="
            emit('edit', {
              type: 'delete-element',
              transientId: element.id,
            })
          "
        >
          <Trash :size="14" />
        </button>
      </div>

      <button
        type="button"
        data-action="insert-after"
        title="Insert after"
        :class="`tr-insert tr-insert-${getFlow(root)}`"
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
import { getFlow } from '@/lib/flow.ts'
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'

const props = defineProps<{ root: Node[]; element: TransientElement }>()
const emit = defineEmits<EditorEvents & { 'insert-component': [data: { targetID: string }] }>()

// component name > slot name > tag
const label = computed(() => {
  return props.element.tag
})
</script>
