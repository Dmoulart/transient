// import { ref, readonly, onMounted, onUnmounted } from 'vue'

import { useEventListener } from '@vueuse/core'
import { ref, triggerRef, type Ref } from 'vue'

export function useSelection() {
  const selection = ref<Selection | null>(null)
  let observer: MutationObserver | null = null

  function updateSelection() {
    const sel = window.getSelection()

    if (!sel) {
      selection.value = null
      return
    }

    // Disconnect previous observer
    if (observer) {
      observer.disconnect()
      observer = null
    }

    selection.value = sel

    triggerRef(selection)

    observer = new MutationObserver(() => {
      triggerRef(selection)
    })

    observer.observe(document, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: true,
    })
  }

  useEventListener(document, 'selectionchange', updateSelection)

  return selection
}
