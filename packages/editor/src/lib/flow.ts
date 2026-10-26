export type Flow = 'top' | 'right' | 'bottom' | 'left'

export function getFlow(root: Node[]): Flow {
  let el = root.findLast((n): n is Element => n instanceof Element)
  while (el && getComputedStyle(el).display === 'contents') {
    el = el.lastElementChild ?? undefined
  }

  let parent = el?.parentElement
  while (parent && getComputedStyle(parent).display === 'contents') {
    parent = parent.parentElement
  }
  if (!el || !parent) return 'bottom'

  const parentStyle = getComputedStyle(parent)
  const rtl = parentStyle.direction === 'rtl'
  const inline: Flow = rtl ? 'left' : 'right'

  if (parentStyle.display.includes('flex')) {
    switch (parentStyle.flexDirection) {
      case 'column':
        return 'bottom'
      case 'column-reverse':
        return 'top'
      case 'row-reverse':
        return rtl ? 'right' : 'left'
      default:
        return inline
    }
  }

  if (parentStyle.display.includes('grid'))
    return parentStyle.gridAutoFlow.startsWith('column') ? 'bottom' : inline

  const s = getComputedStyle(el)
  if (s.float === 'left') return 'right'
  if (s.float === 'right') return 'left'
  return s.display.startsWith('inline') || s.display === 'table-cell' ? inline : 'bottom'
}
