<script setup lang="ts">
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { Editor, Mark, type NodeConfig, Node as PmNode } from '@tiptap/vue-3'
import { getDescendantComponents, type TransientElement } from '@transient/ir'
import { h, onErrorCaptured, onUnmounted, shallowRef, Teleport, type VNode } from 'vue'
import type { EditorEvents } from '@/editor/events'
import { editableRoots } from '@/lib/edition/editable-root'
import {
  hasBlocks,
  pmContentToTransientElements,
  transientElementsToPmContent,
} from '@/lib/edition/richtext'
import { parseElementAttributes } from '@/lib/transient/attributes'
import RichTextToolbar from './RichTextToolbar.vue'

const props = defineProps<{
  container: TransientElement
  renderComponent: (element: TransientElement) => VNode
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

const emit = defineEmits<
  EditorEvents & {
    exitEditing: []
    islandsMounted: [{ editor: Editor; islands: Map<string, VNode> }]
  }
>()

let Root: () => void

if (position === (props.occurrence ?? 0)) {
  const elements = new WeakMap<Node, string>()
  const placeholders = new Map<string, HTMLElement>()
  // the component vnodes go to the index (it needs `.component`), the Teleports to the render
  const islands = new Map<string, VNode>()
  const teleports: VNode[] = []

  for (const child of getDescendantComponents(props.container)) {
    const el = document.createElement('tst-island')
    el.contentEditable = 'false'
    placeholders.set(child.id, el)
    elements.set(el, child.id)

    const vnodes = props.renderComponent(child)
    islands.set(child.id, vnodes)
    teleports.push(h(Teleport, { to: el }, vnodes))
  }

  const editor = shallowRef<Editor | undefined>()
  onUnmounted(() => editor.value?.destroy())

  const slotContent = props.container.slots?.[props.slotName] ?? []
  const blocks = hasBlocks(slotContent, placeholders)

  Root = () => {
    // Vue renders the slot's own tag and leaves its children alone: ProseMirror owns them
    const editingContainer = h(props.container.tag, {
      ...parseElementAttributes(props.container),
      'data-test': 'editing-container',
      'data-blocks': blocks || undefined,
      onVnodeMounted(vnode) {
        editor.value = new Editor({
          // mount on the element itself, not in a <div> appended to it
          element: { mount: vnode.el as HTMLElement },
          // a slot of text (it may live in a <span> or an <h3>) stays inline: no paragraph level.
          // One holding <h2>, <p>… is a list of blocks that keep their tag
          extensions: [
            Document.extend({ content: blocks ? 'block+' : 'inline*' }),
            Text,
            UndoRedo,
            Island(placeholders),
            InlineElement(),
            ElementNode('textBlock', { group: 'block', content: 'inline*' }),
            ElementNode('blockContainer', { group: 'block', content: 'block+' }),
            ElementNode('voidElement', { group: 'inline', inline: true, atom: true }),
          ],
          content: transientElementsToPmContent(slotContent, placeholders),
          autofocus: false,
          enableContentCheck: true,
          onMount({ editor }) {
            const initialCaretPosition = editor.view.posAtCoords({
              left: props.mouse.x,
              top: props.mouse.y,
            })

            editor?.chain().focus(initialCaretPosition?.pos).run()
            // callbacks are typed with the core Editor, but this instance is the Vue one
            emit('islandsMounted', { editor: editor as Editor, islands })
          },
          onBlur({ editor }) {
            const root = editor.getJSON()

            const content = pmContentToTransientElements(root!, props.container)

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

    return [
      editingContainer,
      ...teleports,
      editor.value && h(RichTextToolbar, { editor: editor.value }),
    ]
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

  // an IR element ProseMirror can hold: it renders its own tag and attributes.
  // A tagless textBlock is inline content found between blocks (rendered as a div)
  function ElementNode(name: string, spec: Partial<NodeConfig>) {
    return PmNode.create({
      name,
      ...spec,
      addAttributes: () => ({
        id: { default: null },
        // a new block (Enter at the end of a heading) is a paragraph
        tag: { default: 'p' },
        attributes: { default: {} },
      }),
      renderHTML: ({ node }) =>
        spec.atom
          ? [node.attrs.tag, node.attrs.attributes]
          : [node.attrs.tag ?? 'div', node.attrs.attributes, 0],
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
  Root = () => props.render(props.container?.slots ? props.container.slots[props.slotName] : [])
}
</script>
<template
  ><Root /></template
>
<style>
tst-slot-edition:empty {
  display: inline-block;
  min-width: 1ch;
}

/* custom elements are inline: <h2>, <p> inside need a block parent.
   Not display: contents, the editing host would lose focus. The wrapper takes the
   blocks' place as grid/flex item, so their own z-index stops applying: keep the
   edited text above the component's decorative layers (a hero's background) */
tst-slot-edition[data-blocks] {
  display: block;
  position: relative;
  z-index: 1;
}

[contenteditable="true"] {
  outline: none;
}
</style>
