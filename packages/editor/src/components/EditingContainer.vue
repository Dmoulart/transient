<script setup lang="ts">
import { Editor, type JSONContent, Mark, Node as PmNode } from '@tiptap/vue-3'
import { type EditorEvents } from '@/editor/events'
import { captureEditable } from '@/lib/edition/capture'
import { editableRoots } from '@/lib/edition/editable-root'
import { parseElementAttributes } from '@/lib/transient/attributes'
import { getDescendantComponents, type TransientElement } from 'transient'
import { h, onErrorCaptured, onUnmounted, Teleport, type VNode } from 'vue'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'

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
onErrorCaptured((err) => {
  console.log(err)
})

const rootKey = `${props.ownerId}:${props.slotName}`
// setup runs once per copy, in render order: the count gives this copy's position
const position = editableRoots.get(rootKey) ?? 0
editableRoots.set(rootKey, position + 1)
onUnmounted(() => {
  editableRoots.set(rootKey, editableRoots.get(rootKey)! - 1)
})

const emit = defineEmits<EditorEvents & { exitEditing: []; islandsMounted: [Map<string, VNode>] }>()

let root: () => void
const caret = document.caretPositionFromPoint(props.mouse.x, props.mouse.y)
console.log({ caretAfter: caret })
if (position === (props.occurrence ?? 0)) {
  const elements = new WeakMap<Node, string>()
  const placeholders = new Map<string, HTMLElement>()
  // the component vnodes go to the index (it needs `.component`), the Teleports to the render
  const islands = new Map<string, VNode>()
  const teleports: VNode[] = []

  for (const child of getDescendantComponents(props.container)) {
    const el = document.createElement('tst-island')
    el.contentEditable = 'false'
    el.style.display = 'inline-block'
    placeholders.set(child.id, el)
    elements.set(el, child.id)

    const vnodes = props.renderComponent(child)
    islands.set(child.id, vnodes[0]!)
    teleports.push(h(Teleport, { to: el }, vnodes))
  }

  let editor: Editor | undefined
  onUnmounted(() => editor?.destroy())

  root = function () {
    // Vue renders the slot's own tag and leaves its children alone: ProseMirror owns them
    const editingContainer = h(props.container.tag, {
      ...parseElementAttributes(props.container),
      'data-test': 'editing-container',
      onVnodeMounted(vnode) {
        editor = new Editor({
          // mount on the element itself, not in a <div> appended to it
          element: { mount: vnode.el as HTMLElement },
          // a slot is inline content (it may live in a <span> or an <h3>): no paragraph level
          extensions: [
            Document.extend({ content: 'inline*' }),
            Text,
            Island(placeholders),
            InlineElement(),
          ],
          content: toPMContent(props.container.slots?.[props.slotName] ?? []),
          autofocus: false,
          enableContentCheck: true,
          onMount({ editor }) {
            const initialCaretPosition = editor.view.posAtCoords({
              left: props.mouse.x,
              top: props.mouse.y,
            })

            editor?.chain().focus(initialCaretPosition?.pos).run()
          },
          onBlur({ editor }) {
            const root = editor.getJSON()

            const content = captureEditable(root!, props.container)

            emit('edit', {
              type: 'replace-slot-content',
              id: props.ownerId,
              slotName: props.slotName,
              content,
            })
            emit('exitEditing')
          },
        })
      },
    })

    return [editingContainer, ...teleports]
  }

  function toPMContent(content: TransientElement[]): JSONContent {
    return { type: 'doc', content: toPMInline(content) }
  }
  const INLINE_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'a', 'span', 'mark', 'code', 's'])

  function toPMInline(
    content: TransientElement[],
    marks: JSONContent['marks'] = [],
  ): JSONContent[] {
    return content.flatMap((element): JSONContent[] => {
      if (placeholders.has(element.id)) {
        return [{ type: 'island', attrs: { id: element.id } }]
      }

      if (element.tag === '#text') {
        const text = String(element.attributes?.value?.expression ?? '')
        // ProseMirror rejects empty text nodes
        return text ? [{ type: 'text', text, marks }] : []
      }

      if (INLINE_TAGS.has(element.tag)) {
        const attributes = parseElementAttributes(element)
        return toPMInline(element.slots?.default ?? [], [
          ...marks,
          { type: 'inlineElement', attrs: { id: element.id, tag: element.tag, attributes } },
        ])
      }

      return toPMInline(element.slots?.default ?? [])
    })
  }

  function InlineElement() {
    return Mark.create({
      name: 'inlineElement',
      excludes: '',
      addAttributes: () => ({
        id: { default: null },
        tag: { default: 'span' },
        attributes: { default: {} },
      }),
      renderHTML: ({ mark }) => [mark.attrs.tag, mark.attrs.attributes, 0],
    })
  }

  function Island(placeholders: Map<string, HTMLElement>) {
    return PmNode.create({
      name: 'island',
      inline: true,
      group: 'inline',
      atom: true,
      selectable: true,
      addAttributes: () => ({ id: { default: null } }),
      addNodeView:
        () =>
        ({ node }) => {
          const id = node.attrs.id
          return {
            dom: placeholders.get(id)!,
            ignoreMutation: () => true,
            stopEvent: () => true,
            update: (next) => next.attrs.id === id,
          }
        },
    })
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
