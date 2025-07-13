<script setup lang="ts">
import { useSelection } from '@/lib/use-selection'
import { assert, assertIsDefined } from 'transient/src/core/assert'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useComponentPanel, useEditedNode } from '@/lib/use-edition'
import { getTransientID } from 'transient/src/analyzers/html/html'
import { applyEdition, type DeleteElementEdition } from '@/editor/edition'

const selection = useSelection()

const emit = defineEmits<{
  delete: [deletion: DeleteElementEdition]
  'insert-component': [data: { targetNodeID: string }]
}>()

function wrap(tag: string, node: Node) {
  assertIsDefined(selection.value, 'Selection must have a range')

  const wrapper = document.createElement(tag)
  wrapper.appendChild(node.cloneNode(true))

  const parent = node.parentNode
  if (parent) {
    parent.replaceChild(wrapper, node)
  }
  selection.value.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(wrapper)
  selection.value.addRange(newRange)

  return wrapper
}

function wrapSelection(tag: string, sel: Selection): HTMLElement {
  assert(sel.rangeCount > 0, 'Selection must have a range')

  const range = sel.getRangeAt(0)
  const contents = range.extractContents()

  const wrapper = document.createElement(tag)
  // allow to detect we used the rich text editor to add this motherfucker
  wrapper.dataset.textAddition = 'true'

  if (contents.parentNode?.nodeName === tag) {
    // If the contents are already wrapped in the same tag, just return it
    return contents.parentNode as HTMLElement
  }

  wrapper.appendChild(contents)

  range.insertNode(wrapper)

  sel.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(wrapper)
  sel.addRange(newRange)

  return wrapper
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

  return tagNames.some((tag) => el!.closest(tag))
}

function blockAncestorStyle(styles: Record<string, any>, selection: Selection) {
  const block = getBlockContainer(selection)

  if (!(block instanceof HTMLElement)) return false

  for (const style in styles) {
    if (block.computedStyleMap().get(style)?.toString() !== styles[style]) {
      return false
    }
  }

  return true
}

function setBlockAncestorStyle(styles: Record<string, any>, selection: Selection) {
  const block = getBlockContainer(selection)

  if (!(block instanceof HTMLElement)) return

  for (const style in styles) {
    block.attributeStyleMap.set(style, styles[style])
  }
}

function unsetBlockAncestorStyle(styles: Record<string, any>, selection: Selection) {
  const block = getBlockContainer(selection)

  if (!(block instanceof HTMLElement)) return

  for (const style in styles) {
    block.attributeStyleMap.delete(style)
  }
}

function defineTextState(
  isSelected: (selectionValue: typeof selection) => boolean,
): ComputedRef<boolean> {
  return computed(() => {
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

  // Traverse up until a block-level element is found (simplified)
  let el: HTMLElement | null = node as HTMLElement

  while (el && window.getComputedStyle(el).display !== 'block' && el.parentElement) {
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

const panelIsOpen = ref(false)

const toolbarItems: ToolbarItem[] = [
  {
    type: 'item',
    title: 'Bold',
    svg: '<path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 1 1 0 8H6z" />',
    selected: defineTextState((sel) => nodeIn(['strong', 'b'], sel.value as Selection)),
    toggle: defineActionToggle(
      (sel) => wrapSelection('strong', sel!),
      (sel) => unwrapSelection('strong', sel!),
    ),
  },
  {
    type: 'item',
    title: 'Italic',
    svg: '<path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z" />',
    selected: defineTextState((sel) => nodeIn(['i', 'em'], sel.value as Selection)),
    toggle: defineActionToggle(
      (sel) => wrapSelection('em', sel),
      (sel) => unwrapSelection('em', sel),
    ),
  },
  {
    type: 'item',
    title: 'Underline',
    svg: '<path d="M12 17a5 5 0 0 0 5-5V4h-2v8a3 3 0 0 1-6 0V4H7v8a5 5 0 0 0 5 5zm-7 2v2h14v-2z" />',
    selected: defineTextState((sel) => nodeIn(['u'], sel.value as Selection)),
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
    selected: defineTextState((sel) =>
      blockAncestorStyle({ 'text-align': 'left' }, sel.value as Selection),
    ),
    toggle: defineActionToggle(
      (sel) => {
        setBlockAncestorStyle({ 'text-align': 'left' }, sel!)
      },
      (sel) => unsetBlockAncestorStyle({ 'text-align': 'left' }, sel!),
    ),
  },
  {
    type: 'item',
    title: 'Justify Center',
    svg: '<path d="M4 6h16v2H4zm3 4h10v2H7zm-3 4h16v2H4zm3 4h10v2H7z" />',
    selected: defineTextState((sel) =>
      blockAncestorStyle({ 'text-align': 'center' }, sel.value as Selection),
    ),
    toggle: defineActionToggle(
      (sel) => {
        setBlockAncestorStyle({ 'text-align': 'center' }, sel!)
      },
      (sel) => unsetBlockAncestorStyle({ 'text-align': 'center' }, sel!),
    ),
  },
  {
    type: 'item',
    title: 'Justify Right',
    svg: '<path d="M4 6h16v2H4zm6 4h10v2H10zm-6 4h16v2H4zm6 4h10v2H10z" />',
    selected: defineTextState((sel) =>
      blockAncestorStyle({ 'text-align': 'right' }, sel.value as Selection),
    ),
    toggle: defineActionToggle(
      (sel) => {
        setBlockAncestorStyle({ 'text-align': 'right' }, sel!)
      },
      (sel) => unsetBlockAncestorStyle({ 'text-align': 'right' }, sel!),
    ),
  },
  { type: 'separator' },
  // {
  //   type: 'item',
  //   title: 'Ordered List',
  //   svg: '<path d="M8 6h13v2H8zM8 11h13v2H8zM8 16h13v2H8zM3 6h2v2H3zM3 11h2v2H3zM3 16h2v2H3z" />',
  //   selected: defineTextState((sel) => nodeIn(['ol'], sel.value as Selection)),
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
  //   selected: defineTextState((sel) => nodeIn(['ul'], sel.value as Selection)),
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
    toggle: () => {
      const editedNode = useEditedNode()
      assertIsDefined(editedNode.value, 'Edited node must be defined to open component panel')
      const targetNodeID = getTransientID(editedNode.value)
      assertIsDefined(targetNodeID)
      emit('insert-component', { targetNodeID })
      // panel.targetNodeID.value = getTransientID(editedNode.value)
      // panel.open((targetNodeID, componentPath, componentSchema) => {
      //   // emit('edit', {
      //   //   ...data,
      //   //   type: 'add-component',
      //   //   position: 'after',
      //   //   targetId: panel.targetNodeID.value!,
      //   // })
      // })
    },
  },
  {
    type: 'item',
    title: 'Remove',
    svg: '<path d="M6 20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm13-13h-3.5l-1-1h-5l-1 1H5v2h14z"/>',
    selected: ref(false),
    condition() {
      const editedNode = useEditedNode()
      return Boolean(editedNode.value && getTransientID(editedNode.value))
    },
    toggle: () => {
      const editedNode = useEditedNode()
      assertIsDefined(editedNode.value)
      const transientID = getTransientID(editedNode.value)
      assertIsDefined(transientID)
      emit('delete', { type: 'delete-element', transientId: transientID })
      // TODO: implement logic
    },
  },
]
</script>

<template>
  <div class="toolbar">
    <template v-for="(item, index) in toolbarItems" :key="index">
      <button
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
