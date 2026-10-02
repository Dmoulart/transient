<script setup lang="ts">
import { type EditorEvents } from '@/editor/events'
import { useEventListener, whenever } from '@vueuse/core'
import { watch } from 'vue'

const props = defineProps<{ tid: string; container: HTMLElement }>()
const emit = defineEmits<EditorEvents>()
whenever(
  () => props.container,
  (newContainer) => {
    newContainer.contentEditable = 'true'
    console.log('focus!')
    newContainer.focus()
    const stop = useEventListener(newContainer, 'focusout', () => {
      emit('edit', {
        type: 'edit-element',
        node: newContainer,
        transientId: props.tid,
      })
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
