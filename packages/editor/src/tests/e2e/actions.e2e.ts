import { expect, type Page, test } from '@playwright/test'
import { canvas } from './helpers'

// spec: docs/actions.md

const tiles = (page: Page) => canvas(page).locator('[data-test=tile]')
const tile = (page: Page, label: string) =>
  canvas(page).locator('[data-test=tile]', { hasText: new RegExp(`^${label}$`) })

const insertAfter = (page: Page) =>
  page.locator('[data-edition=add-component][data-position=after]')
const deleteSelected = (page: Page) => page.locator('[data-edition=delete-element]').click()

async function pickComponent(page: Page, tag: string) {
  await page.locator(`[data-test=component-item][data-tag=${tag}]`).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?page=Actions&debug=false')
})

test('clicking a component selects it', async ({ page }) => {
  await tile(page, 'A').click()

  await expect(page.locator('[data-test=selection]')).toHaveAttribute('data-tag', 'Tile')
})

test('insert-after in a column inserts between the siblings', async ({ page }) => {
  await tile(page, 'A').click()
  await insertAfter(page).click()
  await pickComponent(page, 'Tile')

  await expect(tiles(page)).toHaveText(['A', 'Tile', 'B', 'C', 'D', 'E'])
})

test('insert-after the last sibling appends', async ({ page }) => {
  await tile(page, 'B').click()
  await insertAfter(page).click()
  await pickComponent(page, 'Tile')

  await expect(tiles(page)).toHaveText(['A', 'B', 'Tile', 'C', 'D', 'E'])
})

test('insert-after in a row inserts between the siblings', async ({ page }) => {
  await tile(page, 'C').click()
  await insertAfter(page).click()
  await pickComponent(page, 'Tile')

  await expect(tiles(page)).toHaveText(['A', 'B', 'C', 'Tile', 'D', 'E'])
})

test('insert-after a component inside a slot stays in that slot', async ({ page }) => {
  await tile(page, 'E').click()
  await insertAfter(page).click()
  await pickComponent(page, 'Tile')

  await expect(tiles(page)).toHaveText(['A', 'B', 'C', 'D', 'E', 'Tile'])
  // same slot = same container
  await expect(tile(page, 'E').locator('xpath=following-sibling::*[1]')).toHaveText('Tile')
})

test('insert-into an empty slot', async ({ page }) => {
  await canvas(page).getByText('EmptySlot', { exact: true }).click()
  await insertAfter(page).click()
  await pickComponent(page, 'Tile')

  await expect(tiles(page)).toHaveText(['A', 'B', 'C', 'D', 'Tile', 'E'])
})

test('delete removes the selected component', async ({ page }) => {
  await tile(page, 'A').click()
  await deleteSelected(page)

  await expect(tiles(page)).toHaveText(['B', 'C', 'D', 'E'])
})

test('in a column the + sits at the bottom', async ({ page }) => {
  await expectInsertOn(page, 'A', 'bottom')
})

test.fixme('in a row the + sits on the right', async ({ page }) => {
  await expectInsertOn(page, 'C', 'right')
})

test.fixme('typing / in an editing slot opens the component menu', async ({ page }) => {
  await canvas(page)
    .getByText('EmptySlot', { exact: true })
    .locator('xpath=following-sibling::div')
    .click()
  await page.keyboard.type('/')

  await expect(page.locator('#slash-menu')).toBeVisible()
})

// the + sits on the edge where the flow continues
async function expectInsertOn(page: Page, label: string, side: 'bottom' | 'right') {
  await tile(page, label).click()
  const box = (await tile(page, label).boundingBox())!
  const button = (await insertAfter(page).boundingBox())!
  const center = { x: button.x + button.width / 2, y: button.y + button.height / 2 }

  if (side === 'bottom') {
    expect(center.y).toBeGreaterThan(box.y + box.height - button.height)
    expect(Math.abs(center.x - (box.x + box.width / 2))).toBeLessThan(button.width)
  } else {
    expect(center.x).toBeGreaterThan(box.x + box.width - button.width)
    expect(Math.abs(center.y - (box.y + box.height / 2))).toBeLessThan(button.height)
  }
}
