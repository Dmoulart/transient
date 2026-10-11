import type { JSONContent } from '@tiptap/vue-3'
import {
  assertIs,
  assertIsArrayOf,
  assertIsDefined,
  someString,
  type TransientElement,
} from 'transient'
import { mapObjectValues } from '../objects'
import { parseElementAttributes } from '../transient/attributes'

export function transientElementsToPmContent(
  content: TransientElement[],
  placeholders: Map<string, HTMLElement>,
): JSONContent {
  return { type: 'doc', content: transientElementsToPMInlineContent(content, placeholders) }
}
const INLINE_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'a', 'span', 'mark', 'code', 's'])

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

  return pmContentToTransientElementsInner(root, byId)
}

function pmContentToTransientElementsInner(
  root: JSONContent,
  byId: Map<string, TransientElement>,
): TransientElement[] {
  const children: TransientElement[] = []

  const stack: TransientElement[] = []

  let depth: number = 0

  for (const node of root.content ?? [root]) {
    const id = node.attrs?.id
    const original = id ? byId.get(id) : undefined

    let wrapper: TransientElement[] = children
    for (const mark of node.marks ?? []) {
      assertIsDefined(mark.attrs)
      assertIs(someString, mark.attrs.tag)

      const id = mark?.attrs?.id
      const index = stack.findIndex((wrapper) => wrapper.id === id)

      if (index === -1) {
        const element: TransientElement = {
          id: id ?? crypto.randomUUID(),
          tag: mark.attrs.tag,
          isComponent: false,
          attributes: mapObjectValues(mark.attrs?.attributes ?? {}, (value: string) => ({
            type: 'literal',
            expression: value,
          })),
          slots: { default: [] },
        }

        depth = stack.push(element)
        wrapper.push(element)
      } else {
        depth = index + 1
      }

      wrapper = depth > 0 ? stack[depth - 1]!.slots!.default : children
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
    } else if (node.type === 'inlineElement') {
      assertIsDefined(node.attrs)

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
    } else {
      throw new Error(`Unexpected node type ${node.type}`)
    }

    wrapper.push(element)
  }

  return children
}
