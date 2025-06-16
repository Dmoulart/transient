<template>
  <Suspense>
    <component v-if="component" :is="component" v-bind="prototype.data">
      <template v-for="(_, slotName) of schema.slots" v-slot:[slotName]>
        <ComponentSlot
          v-if="!prototype.slots[slotName] || prototype.slots[slotName].length === 0"
          :name="slotName"
          @click="emit('click-on-slot', { slotName, prototype })"
        />
        <Component
          v-else
          v-for="slot of prototype.slots[slotName]"
          :prototype="slot.prototype"
          @click-on-slot="emit('click-on-slot', $event)"
        />
      </template>
    </component>
  </Suspense>
</template>
<script setup lang="ts">
import type { Prototype } from '@/lib/use-prototype'
import { useTransient } from '@/lib/use-transient'
import { computed, defineAsyncComponent, type PropType } from 'vue'

const props = defineProps<{ prototype: Prototype; selectable?: boolean }>()
const dictionnary = useTransient().dictionnary
const schema = computed(() => dictionnary[props.prototype.path])

const component = computed(() => {
  props.prototype.path // don't remove this haaha
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ props.prototype.path),
  })
})

const emit = defineEmits<{
  (e: 'click-on-slot', data: { slotName: string; prototype: Prototype }): void
}>()
</script>
