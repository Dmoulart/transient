import { assert, someHTMLElement } from 'transient'

export type IrOpen = {
  type: string
  key: string
  name?: string
}

export type IrClose = {
  key: string
}

export function isOpenIrTag(node: Node) {
  if (node.nodeType === document.COMMENT_NODE) {
    return node.textContent?.startsWith('tst:')
  }

  return false
}

export function parseOpenIrTag(node: Node): IrOpen | null {
  if (isOpenIrTag(node)) {
    const content = node.textContent ?? ''

    if (content.startsWith('tst:')) {
      const [_, type, key, name] = content.split(':')
      return { type, key, name }
    }
  }

  return null
}

export function isCloseIrTag(node: Node) {
  if (node.nodeType === document.COMMENT_NODE) {
    return node.textContent?.startsWith('/tst:')
  }

  return false
}

export function parseCloseIrTag(node: Node): IrClose | null {
  if (isCloseIrTag(node)) {
    const content = node.textContent ?? ''

    if (content.startsWith('/tst:')) {
      const [_, key] = content.split(':')
      return { key }
    }
  }

  return null
}

export function getElementIrTag(element: HTMLElement): Node | null {
  let previous = element.previousSibling

  // Skip text nodes. There are empty text nodes sometimes.
  while (
    previous?.nodeType === document.TEXT_NODE ||
    (previous?.nodeType === document.COMMENT_NODE && !isOpenIrTag(previous))
  ) {
    previous = previous.previousSibling
  }

  if (previous && isOpenIrTag(previous)) {
    const content = previous.textContent ?? ''

    if (content.startsWith('tst:')) {
      return previous
    }
  }

  return null
}

export function getElementIr(element: Element) {
  let previous = element.previousSibling

  // Skip text nodes. There are empty text nodes sometimes.
  while (
    previous?.nodeType === document.TEXT_NODE ||
    (previous?.nodeType === document.COMMENT_NODE && !isOpenIrTag(previous))
  ) {
    previous = previous.previousSibling
  }

  if (previous === null) {
    return null
  }

  return parseOpenIrTag(previous)
}

export function getElementId(element: HTMLElement) {
  return getElementIr(element)?.key
}

export function traverseIrTree(
  from: Node,
  cb: (ir: IrOpen, elements: Node[]) => void,
  inIr: IrOpen | null = null,
) {
  const openIr = inIr ? inIr : parseOpenIrTag(from)

  if (!openIr) {
    return null
  }

  let next = from.nextSibling
  while (next) {
    const closeIr = parseCloseIrTag(next)

    if (closeIr && closeIr.key === openIr.key) {
      break
    }

    const childOpenIr = parseOpenIrTag(next)

    if (childOpenIr) {
      const children = getIrTagChildrenNodes(next)
      cb(childOpenIr, children ?? [])
    } else if (next instanceof HTMLElement && next.firstChild) {
      traverseIrTree(next.firstChild, cb, childOpenIr ?? openIr)
    }

    next = next.nextSibling
  }
}

export function getIrTagChildrenElements(tag: Node): HTMLElement[] | null {
  const openIr = parseOpenIrTag(tag)

  if (!openIr) {
    return null
  }

  const elements: HTMLElement[] = []

  let next = tag.nextSibling
  while (next) {
    const closeIr = parseCloseIrTag(next)

    if (closeIr) {
      assert(openIr.key === closeIr.key)
      break
    }

    if (next instanceof HTMLElement) {
      elements.push(next)
    }

    next = next.nextSibling
  }

  return elements
}

export function getIrTagChildrenNodes(tag: Node): Node[] | null {
  const openIr = parseOpenIrTag(tag)

  if (!openIr) {
    return null
  }

  const elements: Node[] = []

  let next = tag.nextSibling
  while (next) {
    const closeIr = parseCloseIrTag(next)

    if (closeIr && closeIr.key === openIr.key) {
      break
    }

    if (next instanceof Node) {
      elements.push(next)
    }

    next = next.nextSibling
  }

  return elements
}

export function getIrTagSlots(componentTag: Node): HTMLElement[] | null {
  const openIr = parseOpenIrTag(componentTag)

  if (!openIr) {
    return null
  }

  const elements: HTMLElement[] = []

  let next = componentTag.nextSibling
  while (next) {
    const closeIr = parseCloseIrTag(next)

    if (closeIr) {
      assert(openIr.key === closeIr.key)
      break
    }

    if (next instanceof HTMLElement) {
      elements.push(next)
    }

    next = next.nextSibling
  }

  return elements
}

export function getSiblingElementWithIr(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element
  while (current) {
    if (getElementIr(current)) {
      return current
    }

    current = someHTMLElement(current.previousElementSibling)
      ? current.previousElementSibling
      : null
  }

  return null
}

export function findElementIrTag(element: HTMLElement): Node | null {
  let current: HTMLElement | null = element
  while (current) {
    if (getElementIr(current)) {
      return element
    }

    current = someHTMLElement(current.previousElementSibling)
      ? current.previousElementSibling
      : null
  }

  return null
}

export function getAncestorIr(element: HTMLElement, cb: (ir: IrOpen) => boolean) {
  let parent: HTMLElement | null = element

  while (parent) {
    const ir = getElementIr(parent)
    if (ir) return ir
    parent = parent.parentElement
  }

  return null
}

export function findAncestorElementWithIr(
  element: HTMLElement,
  cb: (ir: IrOpen) => boolean = () => true,
): HTMLElement | null {
  let parent: HTMLElement | null = element

  while (parent) {
    const ir = getElementIr(parent)
    if (ir && cb(ir)) return parent
    parent = parent.parentElement
  }

  return null
}

export function findAncestorIrTag(
  element: HTMLElement,
  cb: (ir: Node) => boolean = () => true,
): Node | null {
  let parent: HTMLElement | null = element

  while (parent) {
    const tag = getElementIrTag(parent)
    if (tag && cb(tag)) return tag
    parent = parent.parentElement
  }

  return null
}

export function findClosestAncestorElement(element: HTMLElement) {
  return findAncestorElementWithIr(element)
}

export function findClosestAncestorComponentElement(element: HTMLElement) {
  return findAncestorElementWithIr(element, (ir) => ir.type === 'component')
}
