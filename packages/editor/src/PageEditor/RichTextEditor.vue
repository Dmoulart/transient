<script setup lang="ts">
import { useSelection } from '@/lib/use-selection'
import { get } from 'http'
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

  const editedTextAncestor = range.commonAncestorContainer

  const wrappingTag = (
    editedTextAncestor instanceof Element
      ? editedTextAncestor.closest(tag)
      : editedTextAncestor.parentElement?.closest(tag)
  ) as HTMLElement | null
  if (!wrappingTag) return

  const parentOfWrappingTag = wrappingTag.parentNode

  if (!parentOfWrappingTag) return

  const offset = getElementCharacterOffsets(
    wrappingTag as HTMLElement,
    parentOfWrappingTag as HTMLElement,
  )

  while (wrappingTag.firstChild) {
    parentOfWrappingTag.insertBefore(wrappingTag.firstChild, wrappingTag)
  }

  parentOfWrappingTag.removeChild(wrappingTag)

  sel.removeAllRanges()

  const newRange = document.createRange()
  const startPos = getNodeForCharacterOffset(parentOfWrappingTag, offset.start)
  const endPos = getNodeForCharacterOffset(parentOfWrappingTag, offset.end)

  console.log(startPos, endPos)
  if (startPos && endPos) {
    newRange.setStart(startPos.node, startPos.offset)
    newRange.setEnd(endPos.node, endPos.offset)
  } else {
    console.warn('Invalid offsets for range')
  }
  sel.addRange(newRange)
}

function nodeIn(tagNames: string[], selection: Selection) {
  let el = selection?.focusNode

  while (el && el.nodeType === Node.TEXT_NODE) {
    el = el.parentNode
  }
  if (!(el instanceof HTMLElement)) return false

  return tagNames.some((tag) => el!.closest(tag))
}

function nodeParentStyles(styles: Record<string, any>, selection: Selection) {
  let el = selection?.focusNode

  while (el && el.nodeType === Node.TEXT_NODE) {
    el = el.parentNode
  }
  if (!(el instanceof HTMLElement)) return false
  for (const style in styles) {
    if (el.computedStyleMap().get(style)?.toString() !== styles[style]) {
      return false
    }
  }

  return true
}

function setParentStyle(styles: Record<string, any>, selection: Selection) {
  let el = selection?.focusNode

  while (el && el.nodeType === Node.TEXT_NODE) {
    el = el.parentNode
  }

  if (!(el instanceof HTMLElement)) return false

  for (const style in styles) {
    el.attributeStyleMap.set(style, styles[style])
  }
}

function unsetParentStyle(styles: Record<string, any>, selection: Selection) {
  let el = selection?.focusNode

  while (el && el.nodeType === Node.TEXT_NODE) {
    el = el.parentNode
  }

  if (!(el instanceof HTMLElement)) return false

  for (const style in styles) {
    el.attributeStyleMap.set(style, 'unset')
  }
}

function defineTextState(
  isSelected: (selectionValue: typeof selection) => boolean,
): ComputedRef<boolean> {
  return computed(() => {
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

function getElementCharacterOffsets(
  element: HTMLElement,
  container: HTMLElement,
): { start: number; end: number } {
  let start = 0
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)

  // Find start: sum text length until first text node inside element
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (element.contains(node)) break
    start += node.textContent?.length ?? 0
  }

  // Now get the total length of all text inside the element
  let length = 0
  const innerWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  while (innerWalker.nextNode()) {
    length += innerWalker.currentNode.textContent?.length ?? 0
  }

  return { start, end: start + length }
}

function getNodeForCharacterOffset(root, charOffset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let currentCharCount = 0

  while (walker.nextNode()) {
    const node = walker.currentNode
    const length = node.textContent?.length ?? 0

    if (currentCharCount + length >= charOffset) {
      return { node, offset: charOffset - currentCharCount }
    }

    currentCharCount += length
  }
  return null
}

type ToolbarButton = {
  type: 'item'
  title: string
  svg: string
  selected: ComputedRef<boolean>
  toggle(selected: boolean): void
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
    selected: defineTextState((sel) =>
      nodeParentStyles({ 'text-align': 'left' }, sel.value as Selection),
    ),
    toggle: defineActionToggle(
      (sel) => {
        console.log('justify left')
        setParentStyle({ 'text-align': 'left' }, sel!)
      },
      (sel) => unsetParentStyle({ 'text-align': 'left' }, sel!),
    ),
  },
  {
    type: 'item',
    title: 'Justify Center',
    svg: '<path d="M4 6h16v2H4zm3 4h10v2H7zm-3 4h16v2H4zm3 4h10v2H7z" />',
    selected: defineTextState((sel) =>
      nodeParentStyles({ 'text-align': 'center' }, sel.value as Selection),
    ),
    toggle: () => document.execCommand('justifyCenter'),
  },
  {
    type: 'item',
    title: 'Justify Right',
    svg: '<path d="M4 6h16v2H4zm6 4h10v2H10zm-6 4h16v2H4zm6 4h10v2H10z" />',
    selected: defineTextState((sel) =>
      nodeParentStyles({ 'text-align': 'right' }, sel.value as Selection),
    ),
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
