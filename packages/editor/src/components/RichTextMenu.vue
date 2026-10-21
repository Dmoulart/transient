<template>
  <bubble-menu
    :editor="editor"
    :append-to="document.body"
    :options="{ strategy: 'fixed', placement: 'top' }"
  >
    <div
      class="flex gap-0.5 rounded-(--ui-radius) bg-(--ui-bg) p-1 shadow-lg ring ring-(--ui-border)"
    >
      <UButton
        v-for="{ tag, label, icon } in styles"
        :key="tag"
        :icon="icon"
        :aria-label="label"
        size="sm"
        :color="editor.isActive('inlineElement', { tag }) ? 'primary' : 'neutral'"
        :variant="editor.isActive('inlineElement', { tag }) ? 'soft' : 'ghost'"
        @mousedown.prevent="toggleTag(tag)"
      />
    </div>
  </bubble-menu>
</template>
<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import type { Mark } from '@tiptap/pm/model'

const props = defineProps<{ editor: Editor }>()

const document = window.document

const styles = [
  { tag: 'strong', label: 'Bold', icon: 'i-lucide-bold' },
  { tag: 'em', label: 'Italic', icon: 'i-lucide-italic' },
  { tag: 's', label: 'Strike', icon: 'i-lucide-strikethrough' },
] as const

function toggleTag(tag: string) {
  const { state, view } = props.editor
  const { from, to, empty } = state.selection
  if (empty) return
  const type = state.schema.marks.inlineElement!
  const found = new Set<Mark>()
  state.doc.nodesBetween(from, to, (node) =>
    node.marks.forEach((m) => m.type === type && m.attrs.tag === tag && found.add(m)),
  )
  const transaction = state.tr
  if (found.size) found.forEach((m) => transaction.removeMark(from, to, m))
  else transaction.addMark(from, to, type.create({ tag }))
  view.dispatch(transaction)
}
</script>
