<template>
  <!-- biome-ignore lint/a11y/useKeyWithClickEvents: only stops clicks from reaching the canvas -->
  <details
    open
    class="fixed bottom-4 left-4 z-50 flex max-h-[70vh] w-96 flex-col overflow-auto rounded-xl border border-white/15 bg-[#0C1222]/95 font-mono text-xs text-white shadow-2xl backdrop-blur"
    @click.stop
  >
    <summary
      class="sticky top-0 cursor-pointer bg-[#0C1222] px-3 py-2 tracking-wider text-white/60 uppercase"
    >
      Editor debug
    </summary>

    <section class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2">
      <span class="text-white/40">selection</span>
      <span>
        <template v-if="!selection">—</template>
        <template v-else-if="selection.kind === 'element'">
          <span class="text-teal-300">{{ tagOf(selection.id) }}</span>
          <span class="text-white/30"> {{ short(selection.id) }}</span>
        </template>
        <template v-else>
          slot <span class="text-teal-300">#{{ selection.slotName }}</span> of
          {{ tagOf(selection.ownerId) }}
        </template>
      </span>

      <span class="text-white/40">component</span>
      <span class="text-violet-300">{{ editor.activeComponent.element.value?.tag ?? '—' }}</span>

      <span class="text-white/40">slot</span>
      <span>
        <template v-if="editor.selectedSlot.value">
          <span class="text-teal-300">#{{ editor.selectedSlot.value.slotName }}</span>
          of
          {{ tagOf(editor.selectedSlot.value.ownerId) }}
        </template>
        <template v-else>—</template>
      </span>

      <span class="text-white/40">editing</span>
      <span>
        <template v-if="editing">
          <span class="text-amber-300">{{ tagOf(editing.id) }}</span>
          <span v-if="editing.slotName" class="text-amber-300">
            #{{ editing.slotName
            }}<template v-if="editing.occurrence"> [{{ editing.occurrence }}]</template></span
          >
          <span class="text-white/30"> @ {{ editing.point.x }},{{ editing.point.y }}</span>
        </template>
        <template v-else>—</template>
      </span>
    </section>

    <details v-if="slots.length" open class="border-t border-white/10 px-3 py-2">
      <summary class="cursor-pointer text-white/40">rendered slots ({{ slots.length }})</summary>
      <ul class="mt-1">
        <li v-for="(slot, i) in slots" :key="i" class="flex gap-2">
          <span class="text-teal-300">#{{ slot.name }}</span>
          <span class="text-white/60">{{ slot.nodes.length }} nodes</span>
          <span v-if="slot.fallback" class="text-amber-300">fallback</span>
        </li>
      </ul>
    </details>

    <details open class="border-t border-white/10 px-3 py-2">
      <summary class="cursor-pointer text-white/40">template</summary>
      <DebugTree
        class="mt-1"
        :elements="template.elements"
        :state="treeState"
        @select="(id) => editor.select({ kind: 'element', id })"
      />
    </details>

    <details open class="border-t border-white/10 px-3 py-2">
      <summary class="cursor-pointer text-white/40">
        editions ({{ editor.history.value.length }})
      </summary>
      <ol class="mt-1 flex flex-col gap-0.5">
        <li v-for="(edition, i) in editor.history.value" :key="i" class="flex gap-2">
          <span class="shrink-0 text-emerald-300">{{ edition.type }}</span>
          <span class="truncate text-white/60">{{ describe(edition) }}</span>
        </li>
        <li v-if="!editor.history.value.length" class="text-white/30">none yet</li>
      </ol>
    </details>
  </details>
</template>

<script setup lang="ts">
import { findElementById, type TransientTemplate } from '@transient/ir'
import { computed } from 'vue'
import type { useEditor } from '@/lib/composables/use-editor.ts'
import type { Index } from '@/lib/composables/use-index'
import DebugTree, { type DebugTreeState } from './DebugTree.vue'

const props = defineProps<{
  editor: ReturnType<typeof useEditor>
  template: TransientTemplate
  index: Index
}>()

const selection = computed(() => props.editor.selection.value)
const editing = computed(() => props.editor.editing.value)

const slots = computed(() => {
  const id = props.editor.activeComponent.id.value
  return id ? props.index.slots(id) : []
})

const treeState = computed<DebugTreeState>(() => ({
  selectedId: selection.value?.kind === 'element' ? selection.value.id : null,
  activeId: props.editor.activeComponent.id.value,
  selectedSlot: props.editor.selectedSlot.value,
  editing: editing.value,
}))

const short = (id: string) => id.slice(0, 6)
const tagOf = (id: string) => findElementById(props.template.elements, id)?.tag ?? short(id)

// one line per edition: scalar fields as-is, ids shortened, arrays and objects summarized
function describe(edition: { type: string }) {
  return Object.entries(edition as Record<string, unknown>)
    .filter(([key]) => key !== 'type' && key !== 'prop')
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}[${value.length}]`
      if (value instanceof HTMLElement) return `${key}=<${value.tagName.toLowerCase()}>`
      if (value && typeof value === 'object')
        return `${key}=${(value as { tag?: string }).tag ?? '{…}'}`
      if (typeof value === 'string' && /^[0-9a-f-]{36}$/.test(value))
        return `${key}=${tagOf(value)}`
      return `${key}=${JSON.stringify(value)}`
    })
    .join(' ')
}
</script>
