import { ref, readonly, onMounted, onUnmounted } from 'vue'

export function useSelection() {
  const selection = ref<Selection | null>(null)
  const isCollapsed = ref(true)
  const text = ref('')
  const anchorNode = ref<Node | null>(null)
  const focusNode = ref<Node | null>(null)

  function updateSelection() {
    const sel = window.getSelection()
    if (!sel) {
      selection.value = null
      isCollapsed.value = true
      text.value = ''
      anchorNode.value = null
      focusNode.value = null
      return
    }
    selection.value = sel
    isCollapsed.value = sel.isCollapsed
    text.value = sel.toString()
    anchorNode.value = sel.anchorNode
    focusNode.value = sel.focusNode
  }

  onMounted(() => {
    updateSelection()
    document.addEventListener('selectionchange', updateSelection)
  })

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateSelection)
  })

  return {
    selection: readonly(selection),
    isCollapsed: readonly(isCollapsed),
    text: readonly(text),
    anchorNode: readonly(anchorNode),
    focusNode: readonly(focusNode),
  }
}
