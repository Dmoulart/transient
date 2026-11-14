// A slot rarely has an element of its own: it sits in one the component renders, next to
// a title, a link, Vue's fragment anchors… ProseMirror mounts on that element and owns all
// of its children, so they are lent to it: drawn in place as read-only widgets around the
// document (see Surroundings in extensions.ts), then handed back to Vue as they were.

export type Surroundings = { before: Node[]; after: Node[]; giveBack: () => void }

// text rendered next to the slot would be editable: only an element can be made read-only
export function canBorrow(parent: Node): parent is HTMLElement {
  return (
    parent instanceof HTMLElement &&
    ![...parent.childNodes].some((node) => node instanceof Text && isRendered(node))
  )
}

// whitespace between blocks has no box, a space between two words has one
function isRendered(text: Text) {
  const range = document.createRange()
  range.selectNode(text)
  return range.getClientRects().length > 0
}

// `start`: the first node of the slot. The document is drawn right before it
export function borrow(parent: HTMLElement, start: Node): Surroundings {
  const nodes = [...parent.childNodes]
  const attributes = new Map([...parent.attributes].map(({ name, value }) => [name, value]))

  const locked = nodes.filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && !node.hasAttribute('contenteditable'),
  )
  for (const element of locked) element.contentEditable = 'false'

  const at = nodes.indexOf(start as ChildNode)

  return {
    before: nodes.slice(0, at),
    after: nodes.slice(at),
    giveBack() {
      for (const element of locked) element.removeAttribute('contenteditable')
      // ponytail: ProseMirror empties its element when destroyed, so the siblings are
      // re-attached (an <iframe> among them reloads). Keeping them in place needs a
      // destroy that skips the wipe, which ProseMirror doesn't offer
      parent.replaceChildren(...nodes)
      for (const name of parent.getAttributeNames()) {
        if (!attributes.has(name)) parent.removeAttribute(name)
      }
      for (const [name, value] of attributes) {
        if (parent.getAttribute(name) !== value) parent.setAttribute(name, value)
      }
    },
  }
}
