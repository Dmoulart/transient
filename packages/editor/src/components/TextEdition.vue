<script setup lang="ts">
import { type EditorEvents } from '@/editor/events'
import { useEventListener, whenever } from '@vueuse/core'
import { nextTick, watch } from 'vue'

const props = defineProps<{ tid: string; container: HTMLElement }>()
const emit = defineEmits<EditorEvents>()
whenever(
  () => props.container,
  (newContainer) => {
    emit('edit', {
      type: 'start-element-edition',
      transientId: props.tid,
    })

    const before = JSON.stringify(newContainer.innerHTML)

    const stop = useEventListener(newContainer, 'focusout', () => {
      const after = JSON.stringify(newContainer.innerHTML)
      // small security..
      // when leaving an empty slot with a default value, this edition will register the default slot content as a transient node
      // which cause havoc. A default slot value should not be part of the template
      if (before !== after) {
        // emit('edit', {
        //   type: 'update-element',
        //   node: newContainer,
        //   transientId: props.tid,
        // })
        emit('edit', {
          type: 'end-element-edition',
          transientId: props.tid,
        })
      }
    })

    watch(
      () => props.container,
      () => {
        stop()
        newContainer.removeAttribute('contenteditable')
      },
      { once: true },
    )
  },
  { immediate: true },
)
</script>
<template>
  <slot />
</template>
