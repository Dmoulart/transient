<template>
  <div class="flex justify-center items-center overflow-hidden flex-1">
    <Suspense>
      <component v-if="component" :is="component" v-bind="data">
        <template v-for="(_, slot) of schema.slots" v-slot:[slot]>
          <ComponentSlot
            v-if="!slots[slot] || slots[slot].length === 0"
            :name="slot"
            @append="editedSlot = $event"
          />
          <ComponentView
            v-else
            v-for="path of slots[slot]"
            :path="path"
            :schema="{
              props: {},
              slots: {},
            }"
            :slots="{}"
          />
        </template>
      </component>
    </Suspense>
    <UDrawer
      class="max-w-125"
      direction="right"
      :open="editedSlot"
      :overlay="false"
      @close="editedSlot = undefined"
    >
      <template #content>
        <ComponentList
          :dictionnary="dictionnary"
          @select="$emit('append', { slot: editedSlot, path: $event })"
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

const props = defineProps<{
  path: string
  schema: TransientComponentSchema
  slots: Record<string, string[]>
  data?: Record<string, any>
}>()

const dictionnary = useTransient().dictionnary

const component = computed(() => {
  props.path // don't remove this haaha
  return defineAsyncComponent(() => import(/* @vite-ignore */ props.path))
})

const editedSlot = ref()
</script>

<style></style>
