<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <aside
      ref="drawer"
      v-if="open"
      class="fixed inset-y-0 right-0 w-full max-w-125 overflow-y-auto border-l border-default bg-(--ui-bg) p-4 shadow-lg"
    >
      <UButton icon="i-lucide-x" variant="ghost" class="absolute top-2 right-2" @click="close" />
      <slot></slot>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const props = withDefaults(defineProps<{ open: boolean }>(), { open: false })
const emit = defineEmits<{ close: [] }>()

const drawer = useTemplateRef('drawer')

function close() {
  if (props.open) {
    emit('close')
  }
}

onClickOutside(drawer, close, {
  ignore: ['[data-reka-popper-content-wrapper]'],
})
onKeyStroke('Escape', close)
</script>
