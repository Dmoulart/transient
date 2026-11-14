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

export function getElementViewportIntersection(el: HTMLElement) {
  const rect = getAbsoluteRect(el)

  const viewport = getAbsoluteViewportRect()

  const top = Math.min(Math.max(viewport.top, rect.top), viewport.bottom)
  const bottom = Math.max(Math.min(viewport.bottom, rect.bottom), viewport.top)
  const height = bottom - top

  // @todo it is false
  const ratioY = height / rect.height

  const left = Math.min(Math.max(viewport.left, rect.left), viewport.right)
  const right = Math.max(Math.min(viewport.right, rect.right), viewport.left)
  const width = right - left

  const ratioX = width / rect.width

  const overflowTop = rect.top - viewport.top
  const overflowBottom = rect.bottom - viewport.bottom
  const isTopOverflowing = Math.sign(overflowTop) === -1
  const isBottomOverflowing = Math.sign(overflowBottom) === 1

  return {
    ratioY,
    ratioX,
    isTopOverflowing,
    overflowTop: isTopOverflowing ? overflowTop : 0,
    isBottomOverflowing,
    overflowBottom: isBottomOverflowing ? overflowBottom : 0,
  }
}

function getAbsoluteRect(el: HTMLElement) {
  const rect = el.getBoundingClientRect()

  const scrollX = window.scrollX || document.documentElement.scrollLeft
  const scrollY = window.scrollY || document.documentElement.scrollTop

  return {
    top: rect.top + scrollY,
    bottom: rect.bottom + scrollY,
    left: rect.left + scrollX,
    right: rect.right + scrollX,
    height: rect.height,
    width: rect.width,
  }
}

function getAbsoluteViewportRect() {
  const scrollX = window.scrollX || document.documentElement.scrollLeft
  const scrollY = window.scrollY || document.documentElement.scrollTop

  const width = window.innerWidth
  const height = window.innerHeight

  return {
    top: scrollY,
    left: scrollX,
    bottom: scrollY + height,
    right: scrollX + width,
    width: width,
    height: height,
  }
}
