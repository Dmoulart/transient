import type { JSONContent } from '@tiptap/vue-3'
import { assertDefined, assertIs, someString } from '@transient/core'
import type { TransientElement } from '@transient/ir'
import { mapObjectValues } from '../objects'
import { parseElementAttributes } from '../transient/attributes'

export function transientElementsToPmContent(
  content: TransientElement[],
  placeholders: Map<string, HTMLElement>,
): JSONContent {
  return {
    type: 'doc',
    content: hasBlocks(content, placeholders)
      ? transientElementsToPMBlocks(content, placeholders)
      : transientElementsToPMInlineContent(content, placeholders),
  }
}

// elements without content that sit in the text (<br>, <img>)
export const VOID_TAGS = new Set(['br', 'img', 'wbr'])

function isInline(element: TransientElement, placeholders: Map<string, HTMLElement>) {
  return (
    element.tag === '#text' ||
    INLINE_TAGS.has(element.tag) ||
    VOID_TAGS.has(element.tag) ||
    placeholders.has(element.id)
  )
}

// a slot holding <h2>, <p>… gets a block document, where each block keeps its tag
export function hasBlocks(content: TransientElement[], placeholders: Map<string, HTMLElement>) {
  return content.some((element) => !isInline(element, placeholders))
}

function elementAttrs(element: TransientElement) {
  return { id: element.id, tag: element.tag, attributes: parseElementAttributes(element) }
}

function transientElementsToPMBlocks(
  content: TransientElement[],
  placeholders: Map<string, HTMLElement>,
): JSONContent[] {
  const blocks: JSONContent[] = []
  let run: TransientElement[] = []

  // inline content between blocks goes in a tagless block, unwrapped on the way back
  const flush = () => {
    const inline = transientElementsToPMInlineContent(run, placeholders)
    // whitespace between blocks is markup indentation, not content
    if (inline.some((node) => node.type !== 'text' || node.text?.trim())) {
      blocks.push({
        type: 'textBlock',
        attrs: { id: null, tag: null, attributes: {} },
        content: inline,
      })
    }
    run = []
  }

  for (const element of content) {
    if (isInline(element, placeholders)) {
      run.push(element)
      continue
    }
    flush()
    const children = element.slots?.default ?? []
    blocks.push(
      hasBlocks(children, placeholders)
        ? {
            type: 'blockContainer',
            attrs: elementAttrs(element),
            content: transientElementsToPMBlocks(children, placeholders),
          }
        : {
            type: 'textBlock',
            attrs: elementAttrs(element),
            content: transientElementsToPMInlineContent(children, placeholders),
          },
    )
  }
  flush()

  return blocks
}
// rich text formatting: part of the text, never selected on its own
export const INLINE_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'a',
  'span',
  'mark',
  'code',
  's',
])

export function transientElementsToPMInlineContent(
  content: TransientElement[],
  placeholders: Map<string, HTMLElement>,
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

    if (VOID_TAGS.has(element.tag)) {
      return [{ type: 'voidElement', attrs: elementAttrs(element), marks }]
    }

    if (INLINE_TAGS.has(element.tag)) {
      const attributes = parseElementAttributes(element)
      return transientElementsToPMInlineContent(element.slots?.default ?? [], placeholders, [
        ...marks,
        { type: 'inlineElement', attrs: { id: element.id, tag: element.tag, attributes } },
      ])
    }

    return transientElementsToPMInlineContent(element.slots?.default ?? [], placeholders)
  })
}

export function pmContentToTransientElements(
  root: JSONContent,
  originalElement: TransientElement,
): TransientElement[] {
  const byId = new Map<string, TransientElement>()
  const index = (elements: TransientElement[]) => {
    for (const element of elements) {
      byId.set(element.id, element)
      Object.values(element.slots ?? {}).forEach(index)
    }
  }

  Object.values(originalElement.slots ?? {}).forEach(index)

  return pmContentToTransientElementsInner(root.content ?? [], byId, new Set())
}

const literalAttributes = (attributes: Record<string, string> = {}) =>
  mapObjectValues(attributes, (value: string) => ({ type: 'literal' as const, expression: value }))

function pmContentToTransientElementsInner(
  nodes: JSONContent[],
  byId: Map<string, TransientElement>,
  // shared by the whole document: a split element (Enter in a <p>) must not reuse its id
  usedIds: Set<string>,
): TransientElement[] {
  const children: TransientElement[] = []

  const stack: TransientElement[] = []

  let depth: number = 0

  for (const node of nodes) {
    const id = node.attrs?.id
    const original = id ? byId.get(id) : undefined

    if (node.type === 'textBlock' || node.type === 'blockContainer') {
      const inner = pmContentToTransientElementsInner(node.content ?? [], byId, usedIds)
      if (!node.attrs?.tag) {
        children.push(...inner)
        continue
      }
      const blockId = id && !usedIds.has(id) ? id : crypto.randomUUID()
      usedIds.add(blockId)
      children.push({
        id: blockId,
        tag: node.attrs.tag,
        isComponent: false,
        attributes: literalAttributes(node.attrs.attributes),
        slots: { default: inner },
      })
      continue
    }

    let wrapper: TransientElement[] = children
    stack.length = node?.marks?.length ?? 0

    if (node.marks) {
      for (const [i, mark] of node.marks.entries()) {
        assertDefined(mark.attrs)
        assertIs(someString, mark.attrs.tag)

        const id = mark?.attrs?.id

        const sameLevelPreviousMark = stack[i]

        if (!sameLevelPreviousMark || sameLevelPreviousMark.id !== id) {
          const element: TransientElement = {
            id: id && !usedIds.has(id) ? id : crypto.randomUUID(),
            tag: mark.attrs.tag,
            isComponent: false,
            attributes: mapObjectValues(mark.attrs?.attributes ?? {}, (value: string) => ({
              type: 'literal',
              expression: value,
            })),
            slots: { default: [] },
          }

          usedIds.add(element.id)

          stack.length = i
          depth = stack.push(element)
          wrapper.push(element)
        } else {
          depth = i + 1
        }

        wrapper = depth > 0 ? stack[depth - 1]!.slots!.default : children
      }
    }

    let element: TransientElement | null
    // islands are opaque: keep the component as it was
    if (original?.isComponent) {
      element = original
    } else if (node.type === 'text') {
      element = {
        id: id ?? crypto.randomUUID(),
        tag: '#text',
        isComponent: false,
        attributes: { value: { type: 'literal', expression: node?.text ?? '' } },
      }
    } else if (node.type === 'voidElement') {
      assertDefined(node.attrs)
      element = {
        id: id && !usedIds.has(id) ? id : crypto.randomUUID(),
        tag: node.attrs.tag,
        isComponent: false,
        attributes: literalAttributes(node.attrs.attributes),
      }
      usedIds.add(element.id)
    } else if (node.type === 'inlineElement') {
      assertDefined(node.attrs)

      element = {
        id: id ?? crypto.randomUUID(),
        tag: node.attrs.tag,
        isComponent: false,
        attributes: mapObjectValues(node.attrs?.attributes ?? {}, (value: string) => ({
          type: 'literal',
          expression: value,
        })),
        slots: { default: [] },
      }
    } else if (node.type === 'doc') {
      continue
    } else {
      throw new Error(`Unexpected node type ${node.type}`)
    }

    wrapper.push(element)
  }

  return children
}
