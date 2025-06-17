<script setup lang="ts">
import { useSelection } from '@/lib/use-selection'
import { useTextSelection } from '@vueuse/core'
import { computed, ref, watch, type ComputedRef } from 'vue'

const props = defineProps<{ node: HTMLElement }>()

const selection = useSelection()

const updateTrigger = ref(0)

function forceUpdate() {
  updateTrigger.value++
}

function wrapSelectionWithTag(tag: string, sel: Selection) {
  debugger
  if (!sel.rangeCount) return
  const range = sel.getRangeAt(0)
  const contents = range.extractContents()

  const wrapper = document.createElement(tag)
  wrapper.appendChild(contents)

  range.insertNode(wrapper)

  // Optionnel : replacer le curseur après
  sel.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(wrapper)
  //   newRange.collapse(false)
  sel.addRange(newRange)
}

function unwrapTag(tag: string, sel: Selection) {
  const range = sel.getRangeAt(0)
  const container = sel.focusNode?.parentElement?.closest(tag)
  if (!container || !(container instanceof HTMLElement)) return

  const parent = container.parentNode
  if (!parent) return

  while (container.firstChild) {
    parent.insertBefore(container.firstChild, container)
  }
  parent.removeChild(container)
}

function nodeIn(tagNames: string[], selection: ReturnType<typeof useSelection>) {
  let el = selection.focusNode.value

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
    console.log('update text state', updateTrigger.value)
    updateTrigger.value // depend on trigger
    if (!selection.focusNode.value) return false
    return isSelected(selection)
  })
}

function defineActionToggle(
  onEnable: (selectionValue: typeof selection) => void,
  onDisable: (selectionValue: typeof selection) => void,
) {
  return function (selected: boolean) {
    console.log('run', selected)
    if (!selected) {
      onEnable(selection)
    } else {
      onDisable(selection)
    }
    forceUpdate()
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
    selected: defineTextState((sel) => nodeIn(['strong', 'b'], sel)),
    toggle: defineActionToggle(
      (sel) => wrapSelectionWithTag('strong', sel.selection.value!),
      (sel) => unwrapTag('strong', sel.selection.value!),
    ),
  },
  {
    type: 'item',
    title: 'Italic',
    svg: '<path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z" />',
    selected: defineTextState((sel) => nodeIn(['i', 'em'], sel)),
    toggle: defineActionToggle(
      (sel) => wrapSelectionWithTag('em', sel.selection.value!),
      (sel) => unwrapTag('em', sel.selection.value!),
    ),
  },
  {
    type: 'item',
    title: 'Underline',
    svg: '<path d="M12 17a5 5 0 0 0 5-5V4h-2v8a3 3 0 0 1-6 0V4H7v8a5 5 0 0 0 5 5zm-7 2v2h14v-2z" />',
    selected: defineTextState((sel) => nodeIn(['u'], sel)),
    toggle: defineActionToggle(
      (sel) => wrapSelectionWithTag('u', sel.selection.value!),
      (sel) => unwrapTag('u', sel.selection!.value!),
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
