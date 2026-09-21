import { useElementBounding, useMutationObserver } from '@vueuse/core'
import { type MaybeRefOrGetter } from 'vue'

// useElementBounding only watches the node itself; a sibling growing moves it without any
// event, so any DOM mutation on the page triggers a recompute (a getBoundingClientRect, cheap).
export function useBoundingBox(node: MaybeRefOrGetter<HTMLElement | null>) {
  const bbox = useElementBounding(node, { windowResize: true, immediate: true, windowScroll: true })

  useMutationObserver(document.body, bbox.update, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  })

  return bbox
}
