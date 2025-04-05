<template>
  <div class="component-view flex justify-center items-center overflow-hidden flex-1">
    <div class="relative">
      <Suspense>
        <component v-if="component" :is="component" v-bind="prototype.data">
          <template v-for="(_, slotName) of schema.slots" v-slot:[slotName]>
            <ComponentSlot
              v-if="!prototype.slots[slotName] || prototype.slots[slotName].length === 0"
              :name="slotName"
              @click="editedSlot = slotName"
            />
            <ComponentView
              v-else
              v-for="slot of prototype.slots[slotName]"
              :prototype="slot.prototype"
              @append="emit('append', $event)"
            />
          </template>
        </component>
      </Suspense>
      <div
        v-if="selectable"
        class="bounding-box absolute shadow-md pointer-events-none z-50 size-full inset-0 p-5"
        style="
          --box-width: calc(100%);
          --box-height: calc(100%);
          --border-color: yellow;
          --dash-size: 10px;
          --dash-thickness: 1px;

          width: var(--box-width);
          height: var(--box-height);
          border-radius: 12px;
          background:
            linear-gradient(90deg, var(--border-color) 50%, transparent 50%),
            linear-gradient(90deg, var(--border-color) 50%, transparent 50%),
            linear-gradient(0deg, var(--border-color) 50%, transparent 50%),
            linear-gradient(0deg, var(--border-color) 50%, transparent 50%);
          background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
          background-size:
            var(--dash-size) var(--dash-thickness),
            var(--dash-size) var(--dash-thickness),
            var(--dash-thickness) var(--dash-size),
            var(--dash-thickness) var(--dash-size);
          background-position:
            0px 0px,
            var(--box-width) var(--box-height),
            0px var(--box-height),
            var(--box-width) 0px;
          animation: border-dance 2s infinite linear;
        "
      />
    </div>

    <UDrawer
      v-if="editedSlot"
      ref="drawer"
      class="max-w-125"
      direction="right"
      :open="Boolean(editedSlot)"
      :overlay="false"
      @close="editedSlot = undefined"
    >
      <template #content>
        <ComponentList
          :dictionnary="dictionnary"
          @select="
            (path) => {
              emit('append', { slot: editedSlot as string, path, to: prototype })
              editedSlot = undefined
            }
          "
        />
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
import { type TransientComponentSchema } from 'transient'
import ComponentSlot from './ComponentSlot.vue'
import ComponentList from './ComponentList.vue'
import { computed, defineAsyncComponent, hydrateOnInteraction, ref, useTemplateRef } from 'vue'
import { useTransient } from '@/stores/use-transient'
import type { Prototype } from '@/stores/use-prototype'
import { watch } from 'vue'
import { defineShortcuts } from '@nuxt/ui/runtime/composables/defineShortcuts.js'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{ prototype: Prototype; selectable?: boolean }>()
const dictionnary = useTransient().dictionnary
const schema = computed(() => dictionnary[props.prototype.path])

const component = computed(() => {
  props.prototype.path // don't remove this haaha
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ props.prototype.path),
    hydrate: hydrateOnInteraction('click'),
  })
})

const emit = defineEmits<{
  (e: 'append', data: { slot: string; path: string; to: Prototype }): void
}>()
const editedSlot = ref<string>()

const drawer = useTemplateRef<HTMLElement>('drawer')
</script>

<style>
.bounding-box {
  display: none;
}
.component-view:hover {
  .bounding-box {
    display: block;
  }
}

@keyframes border-dance {
  0% {
    background-position:
      0px 0px,
      var(--box-width) var(--box-height),
      0px var(--box-height),
      var(--box-width) 0px;
  }
  100% {
    background-position:
      var(--box-width) 0px,
      0px var(--box-height),
      0px 0px,
      var(--box-width) var(--box-height);
  }
}
</style>
