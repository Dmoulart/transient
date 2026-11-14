import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Extension, Mark, type NodeConfig, Node as PmNode } from '@tiptap/vue-3'
import type { Surroundings } from './surroundings'

// The schema a slot is edited with (see richtext.ts for the IR <-> document conversion)
export function extensions({
  blocks,
  placeholders,
  surroundings,
}: {
  blocks: boolean
  placeholders: Map<string, HTMLElement>
  surroundings?: Surroundings
}) {
  return [
    // a slot of text (it may live in a <span> or an <h3>) stays inline: no paragraph level.
    // One holding <h2>, <p>… is a list of blocks that keep their tag
    Document.extend({ content: blocks ? 'block+' : 'inline*' }),
    Text,
    UndoRedo,
    Island(placeholders),
    InlineElement,
    ElementNode('textBlock', { group: 'block', content: 'inline*' }),
    ElementNode('blockContainer', { group: 'block', content: 'block+' }),
    ElementNode('voidElement', { group: 'inline', inline: true, atom: true }),
    ...(surroundings ? [Around(surroundings)] : []),
  ]
}

// <b>, <a>, <span class>…: any inline element is a mark carrying its tag and attributes
const InlineElement = Mark.create({
  name: 'inlineElement',
  excludes: '',
  addAttributes: () => ({
    id: { default: null },
    tag: { default: 'span' },
    attributes: { default: {} },
  }),
  renderHTML: ({ mark }) => [mark.attrs.tag, mark.attrs.attributes, 0],
})

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

// a component in the text: an opaque atom whose view is the element Vue teleports it into
function Island(placeholders: Map<string, HTMLElement>) {
  return PmNode.create({
    name: 'island',
    inline: true,
    group: 'inline',
    atom: true,
    selectable: true,
    addAttributes: () => ({ id: { default: null } }),
    // the clipboard's rendering: a copy of what the component displays
    renderHTML: ({ node }) => {
      const island = document.createElement('tst-island')
      const rendered = placeholders.get(node.attrs.id)
      if (rendered) island.innerHTML = rendered.innerHTML
      return island
    },
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

// What the component renders next to the slot stays where it is, as widgets around the
// document: not part of it, so nothing typed, selected or deleted can reach them.
// `raw` keeps the very nodes Vue rendered (its empty text anchors included), unwrapped
function Around({ before, after }: Surroundings) {
  const widget = (node: Node, position: number, side: number) =>
    // a function: ProseMirror only reuses a widget's view across updates for those
    Decoration.widget(position, () => node, {
      raw: true,
      // widgets at the same position are drawn by ascending side
      side,
      key: String(side),
      ignoreSelection: true,
      stopEvent: () => true,
    })

  return Extension.create({
    name: 'around',
    addProseMirrorPlugins: () => [
      new Plugin({
        props: {
          decorations: ({ doc }) =>
            DecorationSet.create(doc, [
              ...before.map((node, i) => widget(node, 0, i - before.length)),
              ...after.map((node, i) => widget(node, doc.content.size, i + 1)),
            ]),
        },
      }),
    ],
  })
}
