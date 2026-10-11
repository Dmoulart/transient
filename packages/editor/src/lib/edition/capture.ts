import type { JSONContent } from '@tiptap/vue-3'
import { assertIs, assertIsDefined, someString, type TransientElement } from 'transient'

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
type Stack<T = string> = {
  [key: string]: T | Stack<T>
}
function capture(
  root: JSONContent,
  byId: Map<string, TransientElement>,
  stack: Stack = { root: {} },
  stackElements: Record<string, TransientElement> = {},
  currentStackElementId: string = 'root',
): TransientElement[] {
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
        const newStackElements: TransientElement[] = []

        let bottom = stack[currentStackElementId]
        for (const mark of node.marks) {
          assertIsDefined(mark.attrs)
          assertIs(someString, mark.attrs.id)

          currentStackElementId = mark.attrs.id

          if (!bottom[currentStackElementId]) {
            bottom[currentStackElementId] = {}
            const [element] = capture(mark, byId, bottom, stackElements, currentStackElementId)
            stackElements[element.id] = element
            newStackElements.push(element)
          }
          bottom = bottom[currentStackElementId]
        }

        for (let i = 0; i < newStackElements.length; i++) {
          const wrapper = newStackElements[i]
          const wrapped = newStackElements[i + 1]
          wrapper.slots ??= { default: [] }

          if (wrapped) {
            wrapper.slots.default.push(wrapped)
          } else {
            wrapper.slots.default.push(text)
            break
          }
        }

        currentStackElementId = 'root'

        const parentStackElement = newStackElements[0]
        let mustRattachToId: string | null = null

        let parent = children
        if (parentStackElement) {
          for (let i = node.marks.length - 1; i >= 0; i--) {
            const mark = node.marks[i]
            assertIsDefined(mark.attrs)
            assertIs(someString, mark.attrs.id)
            if (mark.attrs.id == parentStackElement.id && i > 0) {
              mustRattachToId = node.marks[i - 1]!.attrs!.id!
              stackElements[mustRattachToId as string].slots ??= { default: [] }
              parent = stackElements[mustRattachToId as string].slots.default
              break
            }
          }
        }

        // const mustRattachToId =
        //   (parentStackElement && stackElements[stack[parentStackElement.id]]) || children

        parent.push(newStackElements[0])
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
