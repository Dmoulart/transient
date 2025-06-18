// import { ref, readonly, onMounted, onUnmounted } from 'vue'

import { useEventListener } from '@vueuse/core'
import { onMounted, onUnmounted, ref, triggerRef, type Ref } from 'vue'

// export function useSelection() {
//   const selection = ref<Selection | null>(null)
//   const isCollapsed = ref(true)
//   const text = ref('')
//   const anchorNode = ref<Node | null>(null)
//   const focusNode = ref<Node | null>(null)

//   function updateSelection() {
//     const sel = window.getSelection()
//     if (!sel) {
//       selection.value = null
//       isCollapsed.value = true
//       text.value = ''
//       anchorNode.value = null
//       focusNode.value = null
//       return
//     }
//     selection.value = sel
//     isCollapsed.value = sel.isCollapsed
//     text.value = sel.toString()
//     anchorNode.value = sel.anchorNode
//     focusNode.value = sel.focusNode
//   }

//   onMounted(() => {
//     updateSelection()
//     document.addEventListener('selectionchange', updateSelection)
//   })

//   onUnmounted(() => {
//     document.removeEventListener('selectionchange', updateSelection)
//   })

//   return {
//     selection: readonly(selection),
//     isCollapsed: readonly(isCollapsed),
//     text: readonly(text),
//     anchorNode: readonly(anchorNode),
//     focusNode: readonly(focusNode),
//   }
// }

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

    const focusNode = sel.focusNode
    if (focusNode) {
      observer = new MutationObserver(() => {
        triggerRef(selection)
        console.log('Selection updated due to mutation')
      })
      observer.observe(focusNode, {
        characterData: true,
        childList: true,
        subtree: true,
      })
    }
  }

  useEventListener(document, 'selectionchange', updateSelection)

  return selection
}
