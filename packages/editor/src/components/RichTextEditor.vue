<script setup lang="ts">
import { assert, getTransientID } from 'transient'
import { type ComputedRef, computed, type Ref, ref } from 'vue'
import { useComponentPanel } from '@/lib/composables/use-components-panel'
import { useTextSelection } from '@/lib/composables/use-text-selection'

const selection = useTextSelection()

type Styles = Record<string, string>

const props = defineProps<{ node: HTMLElement }>()
// dumb widget: says what the user asked, TSelection turns it into editions
const emit = defineEmits<{ delete: []; 'insert-component': [] }>()

// function wrap(tag: string, node: Node) {
//   assertIsDefined(selection.value, 'Selection must have a range')

//   const wrapper = document.createElement(tag)
//   wrapper.appendChild(node.cloneNode(true))

//   const parent = node.parentNode
//   if (parent) {
//     parent.replaceChild(wrapper, node)
//   }
//   selection.value.removeAllRanges()
//   const newRange = document.createRange()
//   newRange.selectNodeContents(wrapper)
//   selection.value.addRange(newRange)

//   return wrapper
// }

function wrapSelection(tag: string, sel: Selection): HTMLElement {
  assert(sel.rangeCount > 0, 'Selection must have a range')

  const range = sel.getRangeAt(0)
  const contents = range.extractContents()

  const wrapper = document.createElement(tag)
  // allow to detect we used the rich text editor to add this motherfucker
  wrapper.dataset.textAddition = 'true'

  wrapper.appendChild(contents)

  range.insertNode(wrapper)
  removeEmptyInlines()

  sel.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(wrapper)
  sel.addRange(newRange)

  return wrapper
}

// extractContents() leaves empty shells behind when the range partially covers an inline (<em></em>)
function removeEmptyInlines() {
  props.node.querySelectorAll('strong:empty, em:empty, u:empty').forEach((el) => {
    el.remove()
  })
}

function unwrapSelection(tag: string, sel: Selection) {
  assert(sel.rangeCount > 0, 'Selection must have a range')
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
  removeEmptyInlines()

  sel.removeAllRanges()

  const newRange = document.createRange()
  const startPos = getNodeForCharacterOffset(parentOfWrappingTag, offset.start)
  const endPos = getNodeForCharacterOffset(parentOfWrappingTag, offset.end)

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

  // closest() can escape the editable zone (a <strong> wrapping the whole page must not light up Bold)
  return tagNames.some((tag) => {
    const match = el.closest(tag)
    return match && props.node.contains(match)
  })
}

// Inline style only: it's what we set, and computed 'start' would never match 'left'
function blockAncestorStyle(styles: Styles, selection: Selection) {
  const block = getBlockContainer(selection)
  if (!block) return false

  return Object.entries(styles).every(
    ([prop, value]) => block.style.getPropertyValue(prop) === value,
  )
}

function setBlockAncestorStyle(styles: Styles, selection: Selection) {
  const block = getBlockContainer(selection)
  if (!block) return

  for (const style in styles) {
    block.style.setProperty(style, styles[style])
  }
}

function unsetBlockAncestorStyle(styles: Styles, selection: Selection) {
  const block = getBlockContainer(selection)
  if (!block) return

  for (const style in styles) {
    block.style.removeProperty(style)
  }
}

function inEditedNode(sel: Selection) {
  return Boolean(sel.anchorNode && props.node.contains(sel.anchorNode))
}

function defineTextState(isSelected: (sel: Selection) => boolean): ComputedRef<boolean> {
  return computed(() => {
    const sel = selection.value
    if (!sel?.focusNode || !inEditedNode(sel)) return false
    return isSelected(sel)
  })
}

function defineActionToggle(
  onEnable: (selectionValue: Selection) => void,
  onDisable: (selectionValue: Selection) => void,
  { allowCollapsed = false } = {},
) {
  return (selected: boolean) => {
    const sel = selection.value
    if (!sel || !inEditedNode(sel)) return
    // wrapping a caret creates an empty <strong> the browser won't reliably type into
    if (sel.isCollapsed && !allowCollapsed) return

    if (!selected) {
      onEnable(sel)
    } else {
      onDisable(sel)
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

function getNodeForCharacterOffset(root: ParentNode, charOffset: number) {
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

function getBlockContainer(selection: Selection): HTMLElement | null {
  let node = selection.focusNode

  while (node && node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode
  }

  if (!(node instanceof HTMLElement)) return null

  // Climb past inline elements, never above the edited node (anything above isn't serialized)
  let el: HTMLElement = node
  while (
    el !== props.node &&
    el.parentElement &&
    getComputedStyle(el).display.startsWith('inline')
  ) {
    el = el.parentElement
  }

  return el
}

type ToolbarButton = {
  type: 'item'
  title: string
  svg: string
  selected: Ref<boolean>
  toggle(selected: boolean): void
}

type ToolbarSeparator = {
  type: 'separator'
}

type ToolbarItem = ({ condition?: () => boolean } & ToolbarButton) | ToolbarSeparator

const toolbarItems: ToolbarItem[] = [
  {
    type: 'item',
    title: 'Bold',
    svg: '<path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 1 1 0 8H6z" />',
    selected: defineTextState((sel) => nodeIn(['strong', 'b'], sel)),
    toggle: defineActionToggle(
      (sel) => wrapSelection('strong', sel),
      (sel) => unwrapSelection('strong', sel),
    ),
  },
  {
    type: 'item',
    title: 'Italic',
    svg: '<path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z" />',
    selected: defineTextState((sel) => nodeIn(['i', 'em'], sel)),
    toggle: defineActionToggle(
      (sel) => wrapSelection('em', sel),
      (sel) => unwrapSelection('em', sel),
    ),
  },
  {
    type: 'item',
    title: 'Underline',
    svg: '<path d="M12 17a5 5 0 0 0 5-5V4h-2v8a3 3 0 0 1-6 0V4H7v8a5 5 0 0 0 5 5zm-7 2v2h14v-2z" />',
    selected: defineTextState((sel) => nodeIn(['u'], sel)),
    toggle: defineActionToggle(
      (sel) => wrapSelection('u', sel),
      (sel) => unwrapSelection('u', sel),
    ),
  },
  { type: 'separator' },
  {
    type: 'item',
    title: 'Justify Left',
    svg: '<path d="M4 6h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z" />',
    selected: defineTextState((sel) => blockAncestorStyle({ 'text-align': 'left' }, sel)),
    toggle: defineActionToggle(
      (sel) => {
        setBlockAncestorStyle({ 'text-align': 'left' }, sel)
      },
      (sel) => unsetBlockAncestorStyle({ 'text-align': 'left' }, sel),
      { allowCollapsed: true },
    ),
  },
  {
    type: 'item',
    title: 'Justify Center',
    svg: '<path d="M4 6h16v2H4zm3 4h10v2H7zm-3 4h16v2H4zm3 4h10v2H7z" />',
    selected: defineTextState((sel) => blockAncestorStyle({ 'text-align': 'center' }, sel)),
    toggle: defineActionToggle(
      (sel) => {
        setBlockAncestorStyle({ 'text-align': 'center' }, sel)
      },
      (sel) => unsetBlockAncestorStyle({ 'text-align': 'center' }, sel),
      { allowCollapsed: true },
    ),
  },
  {
    type: 'item',
    title: 'Justify Right',
    svg: '<path d="M4 6h16v2H4zm6 4h10v2H10zm-6 4h16v2H4zm6 4h10v2H10z" />',
    selected: defineTextState((sel) => blockAncestorStyle({ 'text-align': 'right' }, sel)),
    toggle: defineActionToggle(
      (sel) => {
        setBlockAncestorStyle({ 'text-align': 'right' }, sel)
      },
      (sel) => unsetBlockAncestorStyle({ 'text-align': 'right' }, sel),
      { allowCollapsed: true },
    ),
  },
  { type: 'separator' },
  // {
  //   type: 'item',
  //   title: 'Ordered List',
  //   svg: '<path d="M8 6h13v2H8zM8 11h13v2H8zM8 16h13v2H8zM3 6h2v2H3zM3 11h2v2H3zM3 16h2v2H3z" />',
  //   selected: defineTextState((sel) => nodeIn(['ol'], sel)),
  //   toggle: defineActionToggle(
  //     (sel) => {
  //       wrap('ol', wrapSelection('li', sel))
  //     },
  //     (sel) => {
  //       unwrapSelection('li', sel)
  //       unwrapSelection('ol', sel)
  //     },
  //   ),
  // },
  // {
  //   type: 'item',
  //   title: 'Unordered List',
  //   svg: '<path d="M8 6h13v2H8zM8 11h13v2H8zM8 16h13v2H8zM3 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />',
  //   selected: defineTextState((sel) => nodeIn(['ul'], sel)),
  //   toggle: defineActionToggle(
  //     (sel) => {
  //       wrap('ul', wrapSelection('li', sel))
  //     },
  //     (sel) => {
  //       unwrapSelection('li', sel)
  //       unwrapSelection('ul', sel)
  //     },
  //   ),
  // },
  {
    type: 'item',
    title: 'Insert component',
    svg: ' <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />',
    selected: useComponentPanel().isOpen,
    toggle: () => emit('insert-component'),
  },
  {
    type: 'item',
    title: 'Remove',
    svg: '<path d="M6 20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm13-13h-3.5l-1-1h-5l-1 1H5v2h14z"/>',
    selected: ref(false),
    condition() {
      return Boolean(getTransientID(props.node))
    },
    toggle: () => emit('delete'),
  },
]
</script>

<template>
  <div class="toolbar">
    <template v-for="(item, index) in toolbarItems" :key="index">
      <button
        type="button"
        v-if="item.type === 'item' && (item.condition ? item.condition() : true)"
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

.icon {
  width: 20px;
  height: 20px;
  fill: black;
  transition: fill 0.2s;
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

.separator {
  width: 1px;
  height: 20px;
  background: #ccc;
}
</style>
