import { useEventListener, useFavicon, watchDebounced, whenever } from '@vueuse/core'
import { getTransientID, htmlNodeToTransientElement } from 'transient/src/analyzers/html/html'
import type { TransientElement } from 'transient/src/transient/definition'
import { computed, ref, watch } from 'vue'

const editedNode = ref<Node | undefined>()

useEventListener('focusin', (e) => {
  const element = e.target
  if (element instanceof HTMLElement) {
    const id = getTransientID(element)
    if (id) {
      editedNode.value = element
    }
  }
})

useEventListener('focusout', (e) => {
  editedNode.value = undefined
})

export function useEditedNode() {
  return editedNode
}

const editedTransientElement = computed(() => {
  if (editedNode.value) {
    return htmlNodeToTransientElement(
      editedNode.value,
      getTransientID(editedNode.value) ?? crypto.randomUUID(),
    )
  }

  return undefined
})

export function useEditedTransientElement() {
  return editedTransientElement
}

export function useEdition(edition: {
  onStart?: () => void
  onEnd: (element: TransientElement) => void
}) {
  watch(editedNode, (newNode, oldNode) => {
    if (newNode !== undefined) {
      console.log('start edition')
    }

    if (oldNode !== undefined) {
      const node = htmlNodeToTransientElement(oldNode, getTransientID(oldNode)!)
      edition.onEnd(node)
    }
  })

  return {}
}
