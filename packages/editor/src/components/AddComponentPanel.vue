<template>
  <UDrawer
    class="w-125"
    :open="edit.prototype.value && edit.slot.value"
    direction="left"
    :overlay="false"
    @close="
      () => {
        edit.stop()
      }
    "
  >
    <template #content>
      <ComponentList
        :dictionnary="transient.dictionnary"
        @select="
          (path) => {
            const child = createPrototype(path)
            if (edit.prototype.value && edit.slot.value) {
              edit.prototype!.value.slots[edit.slot.value!] ??= []
              edit.prototype!.value.slots[edit.slot.value!].push({
                type: 'unique',
                prototype: child,
              })
              editedPrototype = edit.prototype.value
              edit.stop()
            }
          }
        "
      />
    </template>
  </UDrawer>
</template>
<script setup lang="ts">
import {
  createPrototype,
  useSelectedPrototype,
  usePrototypeSlotEdition,
  type Prototype,
  useRootPrototype,
} from '@/lib/use-prototype'
import { useTransient } from '@/lib/use-transient'
import ComponentList from './ComponentList.vue'

const transient = useTransient()
const edit = usePrototypeSlotEdition()
const editedPrototype = useSelectedPrototype()
const rootPrototype = useRootPrototype()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'append', data: { slot: string; path: string; to: Prototype }): void
}>()
</script>
