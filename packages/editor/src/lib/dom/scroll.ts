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

export function getElementVisibilityRatio(el: HTMLElement) {
  const rect = getBbox(el)

  const viewport = getViewportRectInPage()

  const intersectionTop = Math.min(Math.max(viewport.top, rect.top), viewport.bottom)
  const intersectionBottom = Math.max(Math.min(viewport.bottom, rect.bottom), viewport.top)
  const intersectionHeight = intersectionBottom - intersectionTop

  const ratioY = intersectionHeight / rect.height

  const intersectionLeft = Math.min(Math.max(viewport.left, rect.left), viewport.right)
  const intersectionRight = Math.max(Math.min(viewport.right, rect.right), viewport.left)
  const intersectionWidth = intersectionRight - intersectionLeft

  const ratioX = intersectionWidth / rect.width

  return {
    y: ratioY,
    x: ratioX,
  }
}

function getBbox(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    bottom: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    height: rect.height,
    width: rect.width,
  }
}
function getViewportRectInPage() {
  // Récupère la position du scroll (avec compatibilité navigateurs)
  const scrollX = window.scrollX || document.documentElement.scrollLeft
  const scrollY = window.scrollY || document.documentElement.scrollTop

  // Dimensions visibles du viewport
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
