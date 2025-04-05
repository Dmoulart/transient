<template>
  <article
    ref="root"
    class="w-30 h-30 flex flex-col gap-1 cursor-pointer border rounded-md p-2"
    :style="style"
    :class="{ fixed: isDragging }"
  >
    <ComponentView class="pointer-events-none" :prototype="prototype" />
    <footer class="truncate">{{ name }}</footer>
  </article>
</template>

<script setup lang="ts">
import { type TransientComponentSchema } from 'transient'
import ComponentView from './ComponentView.vue'
import { getPrototypeName, type Prototype } from '@/stores/use-prototype'
import { ref, useTemplateRef, watch, watchEffect, type WatchHandle } from 'vue'
import { useDraggable, useMouse, whenever } from '@vueuse/core'
import { useMouseIsAbove } from '@/stores/use-mouse-is-above'

const props = defineProps<{ prototype: Prototype }>()
const name = getPrototypeName(props.prototype.path)

const root = useTemplateRef<HTMLElement>('root')

const { style, isDragging } = useDraggable(root, {
  initialValue: { x: 40, y: 40 },
})

const mouse = useMouse({
  type: 'page',
})

const emit = defineEmits<{ (e: 'select', data: string): void }>()

watch(isDragging, (isDragging, wasDragging) => {
  const dropped = wasDragging && !isDragging
  if (dropped) {
    const prototypeView = document.querySelector('#prototype-view')
    if (!prototypeView) {
      console.error('no prototype view')
      return
    }

    const rect = prototypeView?.getBoundingClientRect()

    const isMouseInside =
      mouse.x.value >= rect.left &&
      mouse.x.value <= rect.right &&
      mouse.y.value >= rect.top &&
      mouse.y.value <= rect.bottom
    if (isMouseInside) {
      emit('select', props.prototype.path)
      console.log('Dropped inside prototype view')
    } else {
      console.log('Dropped outside prototype view')
    }
  }
})
</script>

<style></style>
