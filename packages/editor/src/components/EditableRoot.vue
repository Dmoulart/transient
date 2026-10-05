<script setup lang="ts">
import { type EditorEvents } from '@/editor/events'
import { captureEditable } from '@/lib/edition/capture'
import { parseElementAttributes } from '@/lib/transient/attributes'
import { getDescendantComponents, type TransientElement } from 'transient'
import { h, Teleport, type VNode } from 'vue'

const props = defineProps<{
  container: TransientElement
  renderComponent: (element: TransientElement) => VNode[]
  mouse: { x: number; y: number }
  ownerId: string
  slotName: string
}>()

const emit = defineEmits<EditorEvents & { exitEditing: [] }>()

const elements = new WeakMap<Node, string>()
const placeholders = new Map<string, HTMLElement>()
const islands: VNode[] = []

for (const child of getDescendantComponents(props.container)) {
  const el = document.createElement('tst-island')
  el.contentEditable = 'false'
  el.style.display = 'contents'
  placeholders.set(child.id, el)
  elements.set(el, child.id)
  islands.push(h(Teleport, { to: el }, props.renderComponent(child)))
}

const children = renderIslandToHTml(props.container.slots?.[props.slotName] ?? [])

function root() {
  const editionContainer = h(props.container.tag, {
    ...parseElementAttributes(props.container),
    contenteditable: 'true',
    onFocusout: (e: FocusEvent) => {
      const el = e.currentTarget as HTMLElement
      if (e.relatedTarget && el.contains(e.relatedTarget as HTMLElement)) {
        return
      }
      const content = captureEditable(el, props.container, elements)

      emit('edit', {
        type: 'replace-slot-content',
        id: props.ownerId,
        slotName: props.slotName,
        content,
      })
      emit('exitEditing')
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

function renderIslandToHTml(content: TransientElement[]): Node[] {
  const nodes: Node[] = []
  for (const element of content) {
    const placeholder = placeholders.get(element.id)
    if (placeholder) {
      nodes.push(placeholder)
      continue
    }

    if (element.tag === '#text') {
      const textNode = document.createTextNode(
        (element.attributes?.value?.expression as string) ?? '',
      )
      elements.set(textNode, element.id)
      nodes.push(textNode)
      continue
    }
    const root = document.createElement(element.tag)
    elements.set(root, element.id)

    for (const [attrName, { type, expression }] of Object.entries(element.attributes ?? {})) {
      if (type === 'literal') {
        root.setAttribute(attrName, String(expression))
      }
    }

    const children: Node[] = []
    if (element.slots && element.slots.default) {
      children.push(...renderIslandToHTml(element.slots.default))
    }
    root.append(...children)

    nodes.push(root)
  }
  return nodes
}
</script>
<template><root /></template>
<style>
[contenteditable='true'] {
  outline: none;
}
</style>
