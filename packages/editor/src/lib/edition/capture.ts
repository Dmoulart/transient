import type { JSONContent } from '@tiptap/vue-3'
import { assertIsDefined, type TransientElement } from 'transient'

// Reads back the children of an editable root. Nodes built by EditableRoot are found in `ids`;
// anything else was created by the browser and gets a fresh id.
export function captureEditable(
  root: JSONContent,
  originalElement: TransientElement,
): TransientElement[] {
  debugger
  const byId = new Map<string, TransientElement>()
  const index = (elements: TransientElement[]) => {
    for (const element of elements) {
      byId.set(element.id, element)
      Object.values(element.slots ?? {}).forEach(index)
    }
  }

  Object.values(originalElement.slots ?? {}).forEach(index)

  return capture(root, byId)
}

function capture(root: JSONContent, byId: Map<string, TransientElement>): TransientElement[] {
  const children: TransientElement[] = []

  for (const node of root.content ?? [root]) {
    const id = node.attrs?.id
    const original = id ? byId.get(id) : undefined

    // islands are opaque: keep the component as it was
    if (original?.isComponent) {
      children.push(original)
      continue
    }

    if (node.type === 'text') {
      console.log('here')
      if (!node.text) continue

      const text: TransientElement = {
        id: id ?? crypto.randomUUID(),
        tag: '#text',
        isComponent: false,
        attributes: { value: { type: 'literal', expression: node.text } },
      }

      if (node.marks && node.marks.length > 0) {
        const stack: TransientElement[] = []

        for (const mark of node.marks) {
          stack.push(...capture(mark, byId))
        }

        for (let i = 0; i < stack.length; i++) {
          const wrapper = stack[i]
          const wrapped = stack[i + 1]
          wrapper.slots ??= { default: [] }

          if (wrapped) {
            wrapper.slots.default.push(wrapped)
          } else {
            wrapper.slots.default.push(text)
            break
          }
        }

        children.push(stack[0])
      } else {
        children.push(text)
      }

      continue
    }

    if (node.type === 'inlineElement') {
      assertIsDefined(node.attrs)

      children.push({
        id: id ?? crypto.randomUUID(),
        tag: node.attrs.tag,
        isComponent: false,
        attributes: original ? original.attributes : {},
      })
    }
  }

  return children
}
