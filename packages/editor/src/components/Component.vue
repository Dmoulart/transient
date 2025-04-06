<template>
  <Suspense>
    <component v-if="component" :is="component" v-bind="prototype.data">
      <template v-for="(_, slotName) of schema.slots" v-slot:[slotName]>
        <ComponentSlot
          v-if="!prototype.slots[slotName] || prototype.slots[slotName].length === 0"
          :name="slotName"
          @click="editedSlot = slotName"
        />
        <Component
          v-else
          v-for="slot of prototype.slots[slotName]"
          :prototype="slot.prototype"
          @append="$emit('append', $event)"
        />
      </template>
    </component>
  </Suspense>
</template>
<script setup lang="ts">
import type { Prototype } from '@/stores/use-prototype'
import { useTransient } from '@/stores/use-transient'
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps<{ prototype: Prototype; selectable?: boolean }>()
const dictionnary = useTransient().dictionnary
const schema = computed(() => dictionnary[props.prototype.path])

const component = computed(() => {
  props.prototype.path // don't remove this haaha
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ props.prototype.path),
  })
})
</script>
