import { Fragment, reactive, type ComponentInternalInstance, type VNode } from 'vue'

export type Index = ReturnType<typeof useIndex>

export type SlotLocation = {
  name: string
  fallback: boolean
  nodes: Node[]
  container: Node[]
}

export function useIndex() {
  const elements = reactive(new Map<string, VNode>())

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

  function between(start: Node | null, end: Node | null): Node[] {
    const nodes: Node[] = []

    let current = start
    while (current) {
      nodes.push(current)

      if (current === end) {
        break
      }

      current = current.nextSibling
    }

    return nodes
  }

  function range(vnode: VNode): Node[] {
    return between(first(vnode), last(vnode))
  }

  function vnode(id: string): VNode | undefined {
    return elements.get(id)
  }

  function rootNodes(id: string): Node[] {
    const vnode = elements.get(id)
    return vnode ? range(vnode) : []
  }

  function nodesToId() {
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

  function nodeId(node: Node): string | undefined {
    return nodesToId().get(node)
  }

  function closestAncestorId(node: Node, match: (id: string) => boolean = () => true) {
    const ids = nodesToId()

    for (let n: Node | null = node; n; n = n.parentNode) {
      const id = ids.get(n)
      if (id && match(id)) return id
    }

    return null
  }

  function closestComponentId(node: Node) {
    return closestAncestorId(node, (id) => !!elements.get(id)?.component)
  }

  function slots(ownerId: string): SlotLocation[] {
    const instance = elements.get(ownerId)?.component
    if (!instance) return []

    const root = rootNodes(ownerId)
    const found: SlotLocation[] = []

    const walk = (vnode: VNode) => {
      if (isSlotFragment(vnode, instance)) {
        const key = vnode.key as string
        const fallback = key.endsWith('_fb')
        const start = vnode.el as Node
        const end = vnode.anchor as Node
        // drop Fragment anchors (empty text nodes)
        const nodes = between(start, end).slice(1, -1)

        found.push({
          name: key.slice(1, fallback ? -3 : undefined),
          fallback,
          nodes,
          container: containerOf(start, root),
        })
      }

      if (vnode.component) walk(vnode.component.subTree)
      if (Array.isArray(vnode.children)) (vnode.children as VNode[]).forEach(walk)
    }

    walk(instance.subTree)

    return found
  }

  // a slot can be rendered several times (v-for): `occurrence` picks the copy, in render order
  function slot(ownerId: string, slotName: string, occurrence = 0): SlotLocation | undefined {
    return slots(ownerId).filter((slot) => slot.name === slotName)[occurrence]
  }

  function slotAt(ownerId: string, node: Node): { name: string; occurrence: number } | null {
    const found = slots(ownerId)
    const hit =
      found.find((slot) => slot.nodes.some((n) => n.contains(node))) ??
      found.find((slot) => slot.container.some((c) => c.contains(node)))
    if (!hit) return null
    const occurrence = found.filter((slot) => slot.name === hit.name).indexOf(hit)
    return { name: hit.name, occurrence }
  }

  return {
    elements,
    nodeId,
    rootNodes,
    vnode,
    closestAncestorId,
    closestComponentId,
    slots,
    slot,
    slotAt,
  }
}

function isSlotFragment(vnode: VNode, owner: ComponentInternalInstance) {
  return (
    vnode.type === Fragment &&
    // ctx is @internal in Vue's types
    (vnode as VNode & { ctx: ComponentInternalInstance | null }).ctx === owner &&
    typeof vnode.key === 'string' &&
    vnode.key.startsWith('_')
  )
}

// The element holding the slot, if it belongs to the component; otherwise (slot at the
// component's root, e.g. a multi-root component) the component's root nodes.
function containerOf(anchor: Node, root: Node[]): Node[] {
  const parent = anchor.parentNode
  const inside = parent && root.some((node) => node !== parent && node.contains(parent))
  return inside ? [parent] : root
}
