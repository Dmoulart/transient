<template>
  <article
    ref="root"
    class="cursor-grabbing drag w-30 h-30 flex flex-col gap-1 border rounded-md p-2"
    :style="style"
    :class="{ fixed: isDragging, 'cursor-grabbing': draggable, 'cursor-pointer': !draggable }"
    @click="
      () => {
        if (!draggable) {
          $emit('select', prototype.path)
        }
      }
    "
  >
    <ComponentView class="pointer-events-none select-none" :prototype="prototype" />
    <footer class="select-none truncate mt-auto">{{ name }}</footer>
  </article>
</template>

<script setup lang="ts">
import ComponentView from './ComponentView.vue'
import { getPrototypeName, type Prototype } from '@/lib/use-prototype'
import { useTemplateRef, watch } from 'vue'
import { useDraggable, useMouse } from '@vueuse/core'

const props = defineProps<{ prototype: Prototype; draggable?: boolean }>()
const name = getPrototypeName(props.prototype.path)

const root = useTemplateRef<HTMLElement>('root')

const { style, isDragging } = useDraggable(root, {
  initialValue: { x: 40, y: 40 },
})

const mouse = useMouse({
  type: 'page',
})

const emit = defineEmits<{ (e: 'select', data: string): void }>()

if (props.draggable) {
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
        console.log('emit')
        emit('select', props.prototype.path)
        console.log('Dropped inside prototype view')
      } else {
        console.log('Dropped outside prototype view')
      }
    }
  })
}
</script>

<style></style>
