import type { TransientElement } from 'transient'

// Reads back the children of an editable root. Nodes built by EditableRoot are found in `ids`;
// anything else was created by the browser and gets a fresh id.
export function captureEditable(
  root: HTMLElement,
  originalElement: TransientElement,
  ids: WeakMap<Node, string>,
): TransientElement[] {
  const byId = new Map<string, TransientElement>()
  const index = (elements: TransientElement[]) => {
    for (const element of elements) {
      byId.set(element.id, element)
      Object.values(element.slots ?? {}).forEach(index)
    }
  }

  Object.values(originalElement.slots ?? {}).forEach(index)

  return capture(root, byId, ids)
}

function capture(
  parent: Node,
  byId: Map<string, TransientElement>,
  ids: WeakMap<Node, string>,
): TransientElement[] {
  const children: TransientElement[] = []

  for (const node of Array.from(parent.childNodes)) {
    const id = ids.get(node)
    const original = id ? byId.get(id) : undefined

    // islands are opaque: keep the component as it was
    if (original?.isComponent) {
      children.push(original)
      continue
    }

    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent) continue

      children.push({
        id: id ?? crypto.randomUUID(),
        tag: '#text',
        isComponent: false,
        attributes: { value: { type: 'literal', expression: node.textContent } },
      })
      continue
    }

    if (node instanceof HTMLElement) {
      children.push({
        id: id ?? crypto.randomUUID(),
        tag: node.tagName.toLowerCase(),
        isComponent: false,
        // known nodes keep their attributes, browser-made ones get none (drops Chrome's style="")
        attributes: original?.attributes ?? {},
        slots: { default: capture(node, byId, ids) },
      })
    }
  }

  return children
}
