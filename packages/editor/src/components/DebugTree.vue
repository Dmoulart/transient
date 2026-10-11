<template>
  <ul class="border-l border-white/10 pl-3">
    <li v-for="element in elements" :key="element.id">
      <button
        type="button"
        :class="[
          'flex w-full items-baseline gap-2 rounded px-1.5 py-0.5 text-left hover:bg-white/10',
          element.id === state.selectedId && 'bg-teal-400/20 ring-1 ring-teal-400',
          element.id === state.editing?.id && 'bg-amber-400/20 ring-1 ring-amber-400',
        ]"
        @click="emit('select', element.id)"
      >
        <span v-if="element.tag === '#text'" class="truncate text-white/70">
          "{{ text(element) }}"
        </span>
        <span
          v-else
          :class="
            element.isComponent
              ? element.id === state.activeId
                ? 'font-semibold text-violet-300'
                : 'text-violet-300/80'
              : 'text-white/90'
          "
        >
          &lt;{{ element.tag }}&gt;
        </span>
        <span class="ml-auto shrink-0 text-white/30">{{ element.id.slice(0, 6) }}</span>
      </button>

      <template v-for="(children, slotName) in element.slots" :key="slotName">
        <div v-if="element.isComponent" :class="['pl-3', slotClass(element.id, slotName)]">
          #{{ slotName }}
          <span v-if="!children.length" class="text-white/30">(empty)</span>
        </div>
        <DebugTree
          v-if="children.length"
          :elements="children"
          :state="state"
          :class="element.isComponent && 'ml-3'"
          @select="(id) => emit('select', id)"
        />
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { TransientElement } from 'transient'
import type { Editing } from '@/lib/composables/use-editor'

export type DebugTreeState = {
  selectedId: string | null
  activeId: string | null
  selectedSlot: { ownerId: string; slotName: string } | null
  editing: Editing | null
}

const props = defineProps<{ elements: TransientElement[]; state: DebugTreeState }>()
const emit = defineEmits<{ select: [id: string] }>()

const text = (element: TransientElement) => {
  const value = String(element.attributes.value?.expression ?? '').trim()
  return value.length > 32 ? `${value.slice(0, 32)}…` : value
}

function slotClass(ownerId: string, slotName: string) {
  const { editing, selectedSlot } = props.state
  if (editing?.id === ownerId && editing.slotName === slotName) return 'text-amber-300'
  if (selectedSlot?.ownerId === ownerId && selectedSlot.slotName === slotName)
    return 'text-teal-300'
  return 'text-white/40'
}
</script>
