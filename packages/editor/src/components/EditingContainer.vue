<script setup lang="ts">
import { type EditorEvents } from '@/editor/events'
import { useSlashMenu } from '@/lib/composables/use-slash-menu'
import { captureEditable } from '@/lib/edition/capture'
import { editableRoots } from '@/lib/edition/editable-root'
import { parseElementAttributes } from '@/lib/transient/attributes'
import { useEventListener } from '@vueuse/core'
import { getDescendantComponents, type TransientElement } from 'transient'
import { h, onUnmounted, Teleport, type VNode } from 'vue'
const props = defineProps<{
  container: TransientElement
  renderComponent: (element: TransientElement) => VNode[]
  render: (elements: TransientElement[]) => VNode[]
  mouse: { x: number; y: number }
  ownerId: string
  slotName: string
  // which copy of a repeated slot is editable; the others render normally
  occurrence?: number
}>()

const rootKey = `${props.ownerId}:${props.slotName}`
// setup runs once per copy, in render order: the count gives this copy's position
const position = editableRoots.get(rootKey) ?? 0
editableRoots.set(rootKey, position + 1)
onUnmounted(() => {
  editableRoots.set(rootKey, editableRoots.get(rootKey)! - 1)
})

const emit = defineEmits<EditorEvents & { exitEditing: []; islandsMounted: [Map<string, VNode>] }>()

let root: () => void

if (position === (props.occurrence ?? 0)) {
  const elements = new WeakMap<Node, string>()
  const placeholders = new Map<string, HTMLElement>()
  // the component vnodes go to the index (it needs `.component`), the Teleports to the render
  const islands = new Map<string, VNode>()
  const teleports: VNode[] = []

  for (const child of getDescendantComponents(props.container)) {
    const el = document.createElement('tst-island')
    el.contentEditable = 'false'
    el.style.display = 'contents'
    placeholders.set(child.id, el)
    elements.set(el, child.id)

    const vnodes = props.renderComponent(child)
    islands.set(child.id, vnodes[0]!)
    teleports.push(h(Teleport, { to: el }, vnodes))
  }

  const children = renderIslandToHTml(props.container.slots?.[props.slotName] ?? [])

  root = function () {
    const editingContainer = h(props.container.tag, {
      ...parseElementAttributes(props.container),
      contenteditable: 'true',
      'data-test': 'editing-container',
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

          useEventListener(vnode.el, 'keydown', (e) => {
            if (e.key === '/') {
              console.log('hello')
              const slashMenu = useSlashMenu()
              // the caret now, not the click that started editing
              const range = window.getSelection()?.getRangeAt(0)
              slashMenu.rect.value = range?.getBoundingClientRect() ?? null
              slashMenu.open.value = true
            }
          })

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

        emit('islandsMounted', islands)
      },
    })

    return [editingContainer, ...teleports]
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
} else {
  root = function () {
    return props.render(props.container?.slots ? props.container.slots[props.slotName] : [])
  }
}
</script>
<template><root /></template>
<style>
tst-slot-edition:empty {
  display: inline-block;
  min-width: 1ch;
}

[contenteditable='true'] {
  outline: none;
}
</style>
