<script setup lang="ts">
import { type EditorEvents } from '@/editor/events'
import { parseElementAttributes } from '@/lib/transient/attributes'
import { getDescendantComponents, type TransientElement } from 'transient'
import { h, Teleport, type VNode } from 'vue'

const props = defineProps<{
  element: TransientElement
  renderComponent: (element: TransientElement) => VNode[]
  mouse: { x: number; y: number }
  //placeholders: Map<string, HTMLElement>
  //islands: VNode[]
}>()

const emit = defineEmits<EditorEvents>()

const placeholders = new Map<string, HTMLElement>()
const islands: VNode[] = []

for (const child of getDescendantComponents(props.element)) {
  const el = document.createElement('span')
  el.contentEditable = 'false'
  el.dataset.tid = child.id
  placeholders.set(child.id, el)
  islands.push(h(Teleport, { to: el }, props.renderComponent(child)))
}

const children = props.element.slots?.default
  ? props.element.slots.default.map(renderIslandToHTml)
  : []

function root() {
  const editionContainer = h(props.element.tag, {
    ...parseElementAttributes(props.element),
    contenteditable: 'true',
    onFocusout: (e: FocusEvent) => {
      const el = e.currentTarget as HTMLElement
      if (e.relatedTarget && el.contains(e.relatedTarget as HTMLElement)) {
        return
      }

      emit('edit', {
        type: 'end-element-edition',
        transientId: props.element.id,
      })
    },
    onVnodeMounted(vnode) {
      if (vnode.el && vnode.el instanceof HTMLElement) {
        ;(vnode.el as HTMLElement).append(...children)
        ;(vnode.el as HTMLElement).focus({ preventScroll: true })
        const caret = document.caretPositionFromPoint(props.mouse.x, props.mouse.y)

        if (caret && (vnode.el as HTMLElement).contains(caret.offsetNode)) {
          const node = caret.offsetNode
          const range = document.createRange()
          range.setStart(node, caret.offset)
          range.setEnd(node, caret.offset)

          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
      }
    },
  })

  return [editionContainer, ...islands]
}

function renderIslandToHTml(element: TransientElement): Node {
  const placeholder = placeholders.get(element.id)
  if (placeholder) return placeholder
  if (element.tag === '#text') {
    return document.createTextNode((element.attributes?.value?.expression as string) ?? '')
  }
  const root = document.createElement(element.tag)
  for (const [attrName, { type, expression }] of Object.entries(element.attributes ?? {})) {
    if (type === 'literal') {
      root.setAttribute(attrName, String(expression))
    }
  }
  const children: Node[] = []
  if (element.slots && element.slots.default) {
    children.push(...element.slots.default.map(renderIslandToHTml))
  }
  root.append(...children)
  return root
}
</script>
<template><root /></template>
<style>
[contenteditable='true'] {
  outline: none;
}
</style>
