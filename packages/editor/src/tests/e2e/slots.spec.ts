import { test, expect, type Page } from '@playwright/test'

const editable = (page: Page) => page.locator('[data-test=editable]')
const editionZone = (page: Page) => page.locator('[data-test=edition-zone]')

// getByText resolves the smallest *element* containing the text, which may also hold a
// nested component: click the text node itself, like a user would
async function clickText(page: Page, text: string) {
  const canvas = page.locator('[data-test=canvas]')
  await canvas.getByText(text).first().waitFor()
  const box = await canvas.evaluate((canvas, text) => {
    const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const start = node.textContent!.indexOf(text)
      if (start === -1) continue
      // page.mouse doesn't scroll on its own
      node.parentElement!.scrollIntoView({ block: 'center' })
      const range = document.createRange()
      range.setStart(node, start)
      range.setEnd(node, start + text.length)
      const { x, y, width, height } = range.getBoundingClientRect()
      return { x: x + width / 2, y: y + height / 2 }
    }
    return null
  }, text)
  if (!box) throw new Error(`text not found: ${text}`)
  await page.mouse.click(box.x, box.y)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?page=Slots&debug=false')
})

test('clicking a default slot edits it', async ({ page }) => {
  await page.getByText('Plain text in the default slot.').click()

  await expect(editionZone(page)).toHaveAttribute('data-slot-name', 'default')
  await expect(editable(page)).toHaveText('Plain text in the default slot.')
})

test('clicking a named slot edits that slot', async ({ page }) => {
  await page.getByText('Footer slot').click()

  await expect(editionZone(page)).toHaveAttribute('data-slot-name', 'footer')
  await expect(editable(page)).toHaveText('Footer slot')
})

test('clicking a slot nested in the edited slot edits the nested one', async ({ page }) => {
  await clickText(page, 'Outer slot text')
  await expect(editable(page)).toContainText('Outer slot text')

  await clickText(page, 'Nested slot,')

  await expect(editionZone(page)).toHaveAttribute('data-slot-name', 'default')
  await expect(editable(page)).toContainText('Nested slot,')
  await expect(editable(page)).not.toContainText('Outer slot text')
})
