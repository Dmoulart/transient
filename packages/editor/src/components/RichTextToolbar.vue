<template>
  <!-- z-index on the wrapper: tiptap positions it, the inner toolbar is not a positioned element so its own z-index is ignored -->
  <BubbleMenu
    class="tr-z-[var(--tr-z-panel)]"
    :editor="editor"
    :append-to="root"
    :options="{ strategy: 'fixed', placement: 'top' }"
  >
    <ToolbarRoot class="tr-rt-bar" aria-label="Formatting">
      <ToolbarButton
        v-for="{ tag, label, icon } in styles"
        :key="tag"
        class="tr-rt-btn"
        :aria-label="label"
        :aria-pressed="editor.isActive('inlineElement', { tag })"
        @mousedown.prevent="toggleTag(tag)"
      >
        <span :class="icon" aria-hidden="true" />
      </ToolbarButton>
    </ToolbarRoot>
  </BubbleMenu>
</template>
<script setup lang="ts">
import type { Mark } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { ToolbarButton, ToolbarRoot } from 'reka-ui'

const props = defineProps<{ editor: Editor }>()

const root = () => props.editor.view.dom.closest<HTMLElement>('.tr-root') ?? document.body

const styles = [
  { tag: 'strong', label: 'Bold', icon: 'tr-i-lucide-bold' },
  { tag: 'em', label: 'Italic', icon: 'tr-i-lucide-italic' },
  { tag: 's', label: 'Strike', icon: 'tr-i-lucide-strikethrough' },
] as const

function toggleTag(tag: string) {
  const { state, view } = props.editor
  const { from, to, empty } = state.selection
  if (empty) return
  const type = state.schema.marks.inlineElement!
  const found = new Set<Mark>()
  state.doc.nodesBetween(from, to, (node) => {
    for (const m of node.marks) if (m.type === type && m.attrs.tag === tag) found.add(m)
  })
  const transaction = state.tr
  if (found.size) for (const m of found) transaction.removeMark(from, to, m)
  else transaction.addMark(from, to, type.create({ tag }))
  view.dispatch(transaction)
}
</script>
