import { Fragment, reactive, type VNode } from 'vue'

export type Index = ReturnType<typeof useIndex>

export function useIndex() {
  const elements = reactive(new Map<string, VNode>())
  const slots = reactive(new Map<string, VNode[]>())

  function first(vnode: VNode): Node | null {
    if (vnode.component) {
      return first(vnode.component.subTree)
    }

    return vnode.el as Node
  }

  function last(vnode: VNode): Node | null {
    if (vnode.component) {
      return last(vnode.component.subTree)
    }
    return (vnode.type === Fragment ? vnode.anchor : vnode.el) as Node
  }

  function range(vnode: VNode): Node[] {
    const nodes: Node[] = []

    let current = first(vnode)
    const lastNode = last(vnode)

    while (current) {
      nodes.push(current)

      if (current === lastNode) {
        break
      }

      current = current.nextSibling
    }

    return nodes
  }

  function elementsNodesToId() {
    const nodeToId = new Map<Node, string>()

    for (const [id, vnode] of elements.entries()) {
      if (vnode.component) {
        range(vnode).forEach((node) => nodeToId.set(node, id))
      } else if (vnode.el) {
        nodeToId.set(vnode.el as Node, id)
      }
    }
    return nodeToId
  }

  function slotsChildren(targetId: string) {
    const slotsChildren: Record<string, Node[]> = {}

    for (const [id, vnodes] of slots.entries()) {
      if (id.startsWith(targetId)) continue

      const [, slotName] = id.split(':')
      slotsChildren[slotName] ??= []

      for (const vnode of vnodes) {
        if (vnode.component) {
          range(vnode).forEach((node) => slotsChildren[slotName].push(node))
        } else if (vnode.el) {
          slotsChildren[slotName].push(vnode.el as Node)
        }
      }
    }
    return slotsChildren
  }

  function closestAncestorId(node: Node): string | null {
    const ids = elementsNodesToId()

    for (let n: Node | null = node; n; n = n.parentNode) {
      const id = ids.get(n)
      if (id) return id
    }

    return null
  }

  function closestComponentRoot(node: Node): Node[] {
    const id = closestAncestorId(node)
    if (!id) return []
    return locate(id)
  }

  function locate(id: string): Node[] {
    const vnode = elements.get(id)
    return vnode ? range(vnode) : []
  }

  return { elements, slots, closestAncestorId, locate, closestComponentRoot, slotsChildren }
}
