<template>
  <UseBoundingBox :node="node" v-slot="{ bbox }">
    <BoundingBox :bbox="bbox">
      <RichTextEditor
        v-if="text"
        class="pointer-events-auto absolute bottom-full left-0 z-10"
        :node="text"
        @delete="emit('edit', { type: 'delete-element', transientId: id() })"
        @insert-component="emit('insert-component', { targetNodeID: id() })"
      />
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import { assertIsDefined, getTransientID } from 'transient'
import BoundingBox from './BoundingBox.vue'
import RichTextEditor from './RichTextEditor.vue'
import UseBoundingBox from './UseBoundingBox.vue'
import type { EditorEvents } from '@/editor/events'

const props = defineProps<{ node: HTMLElement; text: HTMLElement | null }>()
const emit = defineEmits<EditorEvents>()

function id() {
  const id = getTransientID(props.node)
  assertIsDefined(id)
  return id
}
</script>
