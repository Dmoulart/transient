import { expect, type Page, test } from '@playwright/test'
import type { Rule } from '@/lib/edition/rules'
import { canvas } from './helpers'

// spec: rules hide the actions they deny (resolution logic is unit tested in rules.test.ts)

const open = (page: Page, rules: Rule[]) =>
  page.goto(`/?page=Actions&debug=false&rules=${encodeURIComponent(JSON.stringify(rules))}`)

const tile = (page: Page, label: string) =>
  canvas(page).locator('[data-test=tile]', { hasText: new RegExp(`^${label}$`) })
const emptySlot = (page: Page) => canvas(page).getByText('EmptySlot', { exact: true })

const deleteButton = (page: Page) => page.locator('[data-edition=delete-element]')
const moveButtons = (page: Page) => page.locator('[data-edition=move-element]')
const insertAfter = (page: Page) =>
  page.locator('[data-edition=add-component][data-position=after]')
const pickerItems = (page: Page) => page.locator('[data-test=component-item]')

test('no rules: every action is available', async ({ page }) => {
  await open(page, [])
  await tile(page, 'A').click()

  await expect(deleteButton(page)).toBeVisible()
  await expect(moveButtons(page)).not.toHaveCount(0)

  await insertAfter(page).click()
  await expect(pickerItems(page)).not.toHaveCount(1)
})

test('cannot delete-element hides delete on matching elements only', async ({ page }) => {
  await open(page, [{ select: 'Tile', cannot: 'delete-element' }])

  await tile(page, 'A').click()
  await expect(deleteButton(page)).toHaveCount(0)

  await emptySlot(page).click()
  await expect(deleteButton(page)).toBeVisible()
})

test('cannot move-element hides both arrows', async ({ page }) => {
  await open(page, [{ select: 'Tile', cannot: 'move-element' }])

  // A has a next sibling: the down arrow would be shown without the rule
  await tile(page, 'A').click()
  await expect(moveButtons(page)).toHaveCount(0)
  await expect(deleteButton(page)).toBeVisible()
})

test('a selector can target a single instance', async ({ page }) => {
  await open(page, [{ select: 'Tile[label=A]', cannot: 'delete-element' }])

  await tile(page, 'A').click()
  await expect(deleteButton(page)).toHaveCount(0)

  await tile(page, 'B').click()
  await expect(deleteButton(page)).toBeVisible()
})

test('can add-component restricts the picker', async ({ page }) => {
  await open(page, [{ select: 'Tile', can: 'add-component' }])

  await tile(page, 'A').click()
  await insertAfter(page).click()

  await expect(pickerItems(page)).toHaveCount(1)
  await expect(page.locator('[data-test=component-item][data-tag=Tile]')).toBeVisible()
})

test('cannot add-component removes a component from the picker', async ({ page }) => {
  await open(page, [{ select: 'Tile', cannot: 'add-component' }])

  await tile(page, 'A').click()
  await insertAfter(page).click()

  await expect(pickerItems(page).first()).toBeVisible()
  await expect(page.locator('[data-test=component-item][data-tag=Tile]')).toHaveCount(0)
})
