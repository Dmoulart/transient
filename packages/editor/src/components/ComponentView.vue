<template>
  <div class="flex justify-center items-center overflow-hidden flex-1">
    <Suspense>
      <component v-if="component" :is="component" v-bind="data">
        <template v-for="(_, slotName) of schema.slots" v-slot:[slotName]>
          <ComponentSlot
            v-if="!slots[slotName] || slots[slotName].length === 0"
            :name="slotName"
            @append="editedSlot = $event"
          />
          <ComponentView
            v-else
            v-for="slot of slots[slotName]"
            :path="slot.prototype.path"
            :schema="{
              props: {},
              slots: {},
            }"
            :data="{}"
            :slots="{}"
          />
        </template>
      </component>
    </Suspense>
    <UDrawer
      v-if="editedSlot"
      class="max-w-125"
      direction="right"
      :open="editedSlot"
      :overlay="false"
      @close="editedSlot = undefined"
    >
      <template #content>
        <ComponentList
          :dictionnary="dictionnary"
          @select="emit('append', { slot: editedSlot, path: $event })"
        />
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
import { type TransientComponentSchema } from 'transient'
import ComponentSlot from './ComponentSlot.vue'
import ComponentList from './ComponentList.vue'
import { computed, defineAsyncComponent, ref } from 'vue'
import { useTransient } from '@/stores/use-transient'
import type { Prototype } from '@/stores/use-prototype'
import { watch } from 'vue'

const props = defineProps<Prototype>()
const dictionnary = useTransient().dictionnary
const schema = computed(() => dictionnary[props.path])

const component = computed(() => {
  props.path // don't remove this haaha
  return defineAsyncComponent(() => import(/* @vite-ignore */ props.path))
})

const emit = defineEmits<{ (e: 'append', data: { slot: string; path: string }): void }>()
watch(props.slots, () => console.log(props.slots))
console.log(props.slots)
const editedSlot = ref<string>()
</script>

<style></style>
