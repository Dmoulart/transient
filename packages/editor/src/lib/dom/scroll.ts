export function getScrollParent(element: HTMLElement): HTMLElement {
  const overflowPattern = /(auto|scroll)/

  const currentElementStyle = getComputedStyle(element) // If the element has a fixed position, the scroll parent is the root document element  if (currentElementStyle.position === 'fixed') {    return document.documentElement;  }

  const excludeStaticParent = currentElementStyle.position === 'absolute'

  let parent = element.parentElement

  while (parent) {
    const parentStyle = getComputedStyle(parent)

    if (
      // If it's not necessary to exclude static positions or the parent is not static
      (!excludeStaticParent || parentStyle.position !== 'static') &&
      // Check if the parent is a scroll parent
      overflowPattern.test(
        `${parentStyle.overflow}${parentStyle.overflowY}${parentStyle.overflowX}`,
      )
    )
      return parent

    // Move up the DOM tree to the next parent
    parent = parent.parentElement
  }

  // If no scrollable parent is found, return the root document element
  return document.documentElement
}

export function getElementVisibilityPercentage(el: HTMLElement) {
  const rect = el.getBoundingClientRect()

  const totalHeight = window.innerHeight || document.documentElement.clientHeight
  const totalWidth = window.innerWidth || document.documentElement.clientWidth

  return {
    y: (totalHeight / (rect.top + rect.height)) * 100,
    x: (totalWidth / (rect.left + rect.width)) * 100,
  }
}
