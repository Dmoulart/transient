<script setup lang="ts">
import { useSelection } from '@/lib/use-selection'
import { computed, type ComputedRef } from 'vue'

const selection = useSelection()

function wrap(tag: string, sel: Selection) {
  if (!sel.rangeCount) return

  const range = sel.getRangeAt(0)
  const contents = range.extractContents()

  const wrapper = document.createElement(tag)
  wrapper.appendChild(contents)

  range.insertNode(wrapper)

  sel.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(wrapper)
  sel.addRange(newRange)
}

function unwrap(tag: string, sel: Selection) {
  if (sel.rangeCount === 0) return

  const range = sel.getRangeAt(0)
  const savedRange = range.cloneRange()

  const ancestor = range.commonAncestorContainer
  const container = (
    ancestor instanceof Element ? ancestor.closest(tag) : ancestor.parentElement?.closest(tag)
  ) as HTMLElement | null

  if (!container) return

  const parent = container.parentNode
  if (!parent) return

  while (container.firstChild) {
    parent.insertBefore(container.firstChild, container)
  }
  parent.removeChild(container)
  // does not work why ?
  sel.removeAllRanges()
  sel.addRange(savedRange)
}
function nodeIn(tagNames: string[], selection: Selection) {
  let el = selection?.focusNode

  while (el && el.nodeType === Node.TEXT_NODE) {
    el = el.parentNode
  }
  if (!(el instanceof HTMLElement)) return false

  console.log(
    'in',
    tagNames,
    tagNames.some((tag) => el!.closest(tag)),
  )
  return tagNames.some((tag) => el!.closest(tag))
}

function defineTextState(
  isSelected: (selectionValue: typeof selection) => boolean,
): ComputedRef<boolean> {
  return computed(() => {
    console.log('textState')
    // console.log('update text state', updateTrigger.value)
    // updateTrigger.value // depend on trigger
    if (!selection.value?.focusNode) return false
    return isSelected(selection)
  })
}

function defineActionToggle(
  onEnable: (selectionValue: Selection) => void,
  onDisable: (selectionValue: Selection) => void,
) {
  return function (selected: boolean) {
    if (selection.value === null) return

    if (!selected) {
      onEnable(selection.value)
    } else {
      onDisable(selection.value)
    }
  }
}

type ToolbarButton = {
  type: 'item'
  title: string
  svg: string
  selected: ComputedRef<boolean>
  toggle(): (selected: boolean) => void
}

type ToolbarSeparator = {
  type: 'separator'
}

type ToolbarItem = ToolbarButton | ToolbarSeparator

const toolbarItems: ToolbarItem[] = [
  {
    type: 'item',
    title: 'Bold',
    svg: '<path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 1 1 0 8H6z" />',
    selected: defineTextState((sel) => nodeIn(['strong', 'b'], sel.value as Selection)),
    toggle: defineActionToggle(
      (sel) => wrap('strong', sel!),
      (sel) => unwrap('strong', sel!),
    ),
  },
  {
    type: 'item',
    title: 'Italic',
    svg: '<path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z" />',
    selected: defineTextState((sel) => nodeIn(['i', 'em'], sel.value as Selection)),
    toggle: defineActionToggle(
      (sel) => wrap('em', sel),
      (sel) => unwrap('em', sel),
    ),
  },
  {
    type: 'item',
    title: 'Underline',
    svg: '<path d="M12 17a5 5 0 0 0 5-5V4h-2v8a3 3 0 0 1-6 0V4H7v8a5 5 0 0 0 5 5zm-7 2v2h14v-2z" />',
    selected: defineTextState((sel) => nodeIn(['u'], sel.value as Selection)),
    toggle: defineActionToggle(
      (sel) => wrap('u', sel),
      (sel) => unwrap('u', sel),
    ),
  },
  { type: 'separator' },
  {
    type: 'item',
    title: 'Justify Left',
    svg: '<path d="M4 6h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z" />',
    selected: defineTextState(() => false), // Hard to detect reliably with DOM only
    toggle: () => document.execCommand('justifyLeft'),
  },
  {
    type: 'item',
    title: 'Justify Center',
    svg: '<path d="M4 6h16v2H4zm3 4h10v2H7zm-3 4h16v2H4zm3 4h10v2H7z" />',
    selected: defineTextState(() => false),
    toggle: () => document.execCommand('justifyCenter'),
  },
  {
    type: 'item',
    title: 'Justify Right',
    svg: '<path d="M4 6h16v2H4zm6 4h10v2H10zm-6 4h16v2H4zm6 4h10v2H10z" />',
    selected: defineTextState(() => false),
    toggle: () => document.execCommand('justifyRight'),
  },
  { type: 'separator' },
  {
    type: 'item',
    title: 'Ordered List',
    svg: '<path d="M8 6h13v2H8zM8 11h13v2H8zM8 16h13v2H8zM3 6h2v2H3zM3 11h2v2H3zM3 16h2v2H3z" />',
    selected: defineTextState((sel) => nodeIn(['ol'], sel)),
    toggle: () => document.execCommand('insertOrderedList'),
  },
  {
    type: 'item',
    title: 'Unordered List',
    svg: '<path d="M8 6h13v2H8zM8 11h13v2H8zM8 16h13v2H8zM3 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />',
    selected: defineTextState((sel) => nodeIn(['ul'], sel)),
    toggle: () => document.execCommand('insertUnorderedList'),
  },
]
</script>

<template>
  <div class="toolbar">
    <template v-for="(item, index) in toolbarItems" :key="index">
      <button
        v-if="item.type === 'item'"
        :title="item.title"
        :class="{ active: item.selected.value }"
        @mousedown.prevent="item.toggle(item.selected.value)"
      >
        <svg viewBox="0 0 24 24" class="icon" v-html="item.svg" />
      </button>
      <div v-else class="separator" />
    </template>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f9f9f9;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

button:hover,
button.active {
  background: black;
  .icon {
    fill: white;
  }
}

.icon {
  width: 20px;
  height: 20px;
  fill: black;
  transition: fill 0.2s;
}

.separator {
  width: 1px;
  height: 20px;
  background: #ccc;
}
</style>
