<template>
  <div class="component-view flex justify-center items-center overflow-hidden flex-1">
    <Component
      :prototype="prototype"
      :selectable="selectable"
      @click-on-slot="
        ({ slotName, prototype }) => {
          editedSlot = slotName
          prototypeWhichSlotIsEdited = prototype
        }
      "
    />
    <!-- <div
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
    /> -->

    <UDrawer
      v-if="editedSlot && prototypeWhichSlotIsEdited"
      ref="drawer"
      class="max-w-125"
      direction="right"
      :open="Boolean(editedSlot)"
      :overlay="false"
      @close="
        () => {
          editedSlot = undefined
          prototypeWhichSlotIsEdited = undefined
        }
      "
    >
      <template #content>
        <ComponentList
          :dictionnary="dictionnary"
          @select="
            (path) => {
              emit('append', {
                slot: editedSlot as string,
                path,
                to: prototypeWhichSlotIsEdited as Prototype,
              })
              editedSlot = undefined
              prototypeWhichSlotIsEdited = undefined
            }
          "
        />
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
import Component from './Component.vue'
import ComponentList from './ComponentList.vue'
import { ref, useTemplateRef } from 'vue'
import { useTransient } from '@/stores/use-transient'
import type { Prototype } from '@/stores/use-prototype'

defineProps<{ prototype: Prototype; selectable?: boolean }>()
const dictionnary = useTransient().dictionnary
const prototypeWhichSlotIsEdited = ref<Prototype>()
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
