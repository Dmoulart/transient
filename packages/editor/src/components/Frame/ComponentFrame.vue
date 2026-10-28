<template>
  <UseBoundingBox :targets="root" v-slot="{ bbox }">
    <BoundingBox
      :bbox="bbox"
      :class="hover ? 'tr-frame-hover tr-animate-fade-in' : 'tr-frame-selected'"
    >
      <div v-if="!hover" class="tr-tag-bar">
        <span data-test="selection" :data-tag="element.tag" class="tr-tag">
          {{ label }}
        </span>

        <button
          v-if="canMoveElement(element.id, 'up', template.elements)"
          type="button"
          class="tr-tag-action"
          data-action="move-up"
          :data-action:flow="flow"
          title="Move up"
          @click="
            emit('edit', {
              type: 'move-element',
              id: element.id,
              direction: 'up'
            })
          "
        >
          <MoveUp v-if="flow === 'top' || flow === 'bottom'" :size="14" />
          <MoveLeft v-else :size="14" />
        </button>
        <button
          v-if="canMoveElement(element.id, 'down', template.elements)"
          type="button"
          class="tr-tag-action"
          data-action="move-down"
          :data-action:flow="flow"
          title="Move down"
          @click="
            emit('edit', {
              type: 'move-element',
              id: element.id,
              direction: 'down'
            })
          "
        >
          <MoveDown v-if="flow === 'top' || flow === 'bottom'" :size="14" />
          <MoveRight v-else :size="14" />
        </button>
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
        v-if="!hover"
        type="button"
        data-action="insert-after"
        title="Insert after"
        :class="`tr-insert tr-insert-${getFlow(root)}`"
        @click="() => {
          componentPanel.open((schema) => {
            emit('edit', ({ type: 'add-component', targetId: element.id, position: 'after', element: createComponentFromSchema(schema) }))
          })
        }"
      >
        <Plus class="tr-size-4" :stroke-width="2.5" />
      </button>
    </BoundingBox>
  </UseBoundingBox>
</template>
<script setup lang="ts">
import { canMoveElement, type TransientElement } from '@transient/ir'
import { MoveDown, MoveLeft, MoveRight, MoveUp, Plus, Trash } from 'lucide-vue-next'
import { computed } from 'vue'
import type { EditorEvents } from '@/editor/events'
import { useComponentPanel } from '@/lib/composables/use-components-panel.ts'
import { useTemplate } from '@/lib/composables/use-template.ts'
import { getFlow } from '@/lib/flow.ts'
import { createComponentFromSchema } from '@/lib/transient/attributes.ts'
import BoundingBox from './BoundingBox.vue'
import UseBoundingBox from './UseBoundingBox.vue'

const props = defineProps<{ root: Node[]; element: TransientElement; hover?: boolean }>()
const emit = defineEmits<EditorEvents>()

const componentPanel = useComponentPanel()
const template = useTemplate()

const flow = computed(() => getFlow(props.root))

// component name > slot name > tag
const label = computed(() => {
  return props.element.tag
})
</script>
