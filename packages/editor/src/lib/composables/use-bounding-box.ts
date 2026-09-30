import {
  tryOnMounted,
  unrefElement,
  useEventListener,
  useMutationObserver,
  useResizeObserver,
  type MaybeComputedElementRef,
  type MaybeElement,
  type UseElementBoundingOptions,
  type VueInstance,
} from '@vueuse/core'
import { computed, shallowRef, toValue, unref, watch, type MaybeRefOrGetter } from 'vue'

export type MaybeNode = Node | VueInstance | undefined | null
export type MaybeComputedNodeRef<T extends MaybeNode = MaybeNode> = MaybeRefOrGetter<T>

function unrefNode(node: MaybeComputedNodeRef<MaybeNode>): Node | undefined | null {
  const value = toValue(node)
  if (value && '$el' in value) {
    return value.$el
  }
  return value
}
export function useElementsBounding(
  targets:
    | MaybeComputedNodeRef<MaybeNode>
    | MaybeComputedNodeRef<MaybeNode>[]
    | MaybeRefOrGetter<MaybeNode[]>,
  options: UseElementBoundingOptions = {},
) {
  const {
    reset = true,
    windowResize = true,
    windowScroll = true,
    immediate = true,
    updateTiming = 'sync',
  } = options

  const nodes = computed(() => {
    if (!targets) {
      return []
    }

    const derefElements = unref(targets)

    const nodes = typeof derefElements === 'function' ? derefElements() : derefElements

    const normalized = Array.isArray(nodes) ? nodes : [nodes]

    return normalized
  })

  const targetElements = computed(() => {
    return nodes.value.filter((node) => node instanceof HTMLElement)
  })

  const height = shallowRef(0)
  const bottom = shallowRef(0)
  const left = shallowRef(0)
  const right = shallowRef(0)
  const top = shallowRef(0)
  const width = shallowRef(0)
  const x = shallowRef(0)
  const y = shallowRef(0)

  function recalculate() {
    if (!nodes.value || nodes.value.length === 0) {
      if (reset) {
        height.value = 0
        bottom.value = 0
        left.value = 0
        right.value = 0
        top.value = 0
        width.value = 0
        x.value = 0
        y.value = 0
      }
      return
    }

    let union: Bbox | null = null
    for (const element of nodes.value) {
      const node = unrefNode(element)
      if (!node) {
        continue
      }

      let rect: Bbox | null = null

      if (node instanceof Element) {
        rect = node.getBoundingClientRect()
      } else if (node.nodeType === document.TEXT_NODE && node.textContent !== '') {
        const range = document.createRange()
        range.selectNodeContents(node)
        rect = range.getBoundingClientRect()
      } else {
        continue
      }

      if (union) {
        union = mergeBbox(union, rect)
      } else {
        union = rect
      }
    }

    if (!union) {
      return
    }

    height.value = union.height
    bottom.value = union.bottom
    left.value = union.left
    right.value = union.right
    top.value = union.top
    width.value = union.width
    x.value = union.x
    y.value = union.y
  }

  function update() {
    if (updateTiming === 'sync') recalculate()
    else if (updateTiming === 'next-frame') requestAnimationFrame(() => recalculate())
  }
  useResizeObserver(targetElements, update)
  watch(
    () => targets,
    (ele) => !ele && update(),
  )
  useMutationObserver(targetElements, update, {
    attributeFilter: ['style', 'class'],
  })
  if (windowScroll) useEventListener('scroll', update, { capture: true, passive: true })
  if (windowResize) useEventListener('resize', update, { passive: true })

  tryOnMounted(() => {
    if (immediate) update()
  })
  // perf crap, react to any edition instead.
  useMutationObserver(document.body, update, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  })

  return {
    height,
    bottom,
    left,
    right,
    top,
    width,
    x,
    y,
    update,
  }
}

type Bbox = {
  height: number
  width: number
  bottom: number
  left: number
  right: number
  top: number
  x: number
  y: number
}

function mergeBbox(a: Bbox, b: Bbox): Bbox {
  const top = Math.min(a.top, b.top)
  const left = Math.min(a.left, b.left)
  const bottom = Math.max(a.bottom, b.bottom)
  const right = Math.max(a.right, b.right)
  return { top, left, bottom, right, x: left, y: top, width: right - left, height: bottom - top }
}
