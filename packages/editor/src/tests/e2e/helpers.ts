import type { Page } from '@playwright/test'

export const canvas = (page: Page) => page.locator('[data-test=canvas]')

// getByText resolves the smallest *element* containing the text, which may also hold a
// nested component: click the text node itself, like a user would
export async function clickText(page: Page, text: string, { dx = 0 } = {}) {
  const canvas = page.locator('[data-test=canvas]')
  await canvas.getByText(text).first().waitFor()
  const box = await canvas.evaluate(
    (canvas, { text, dx }) => {
      const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const start = node.textContent!.indexOf(text)
        if (start === -1) continue
        const range = document.createRange()
        range.setStart(node, start)
        range.setEnd(node, start + text.length)
        // page.mouse doesn't scroll on its own, and the parent may be taller than the
        // viewport (text at a multi-root component's root): center the text itself
        const before = range.getBoundingClientRect()
        window.scrollBy(0, before.top - window.innerHeight / 2)
        const { x, y, width, height } = range.getBoundingClientRect()
        // dx: offset from the text's right edge instead of its center
        return dx
          ? { x: x + width + dx, y: y + height / 2 }
          : { x: x + width / 2, y: y + height / 2 }
      }
      return null
    },
    { text, dx },
  )
  if (!box) throw new Error(`text not found: ${text}`)
  await page.mouse.click(box.x, box.y)
}
