import { test, expect, type Page } from '@playwright/test'
import { clickText, canvas } from './helpers'

const editingContainer = (page: Page) => page.locator('[data-test=editing-container]')
const editingFrame = (page: Page) => page.locator('[data-test=editing-frame]')

async function expectEditing(page: Page, slotName: string, text: string | RegExp) {
  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', slotName)
  await expect(editingContainer(page)).toHaveCount(1)
  await expect(editingContainer(page)).toHaveText(text)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?page=Slots&debug=false')
})

test('clicking a default slot edits it', async ({ page }) => {
  await page.getByText('Plain text in the default slot.').click()

  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', 'default')
  await expect(editingContainer(page)).toHaveText('Plain text in the default slot.')
})

test('clicking a named slot edits that slot', async ({ page }) => {
  await page.getByText('Footer slot').click()

  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', 'footer')
  await expect(editingContainer(page)).toHaveText('Footer slot')
})

test('clicking a slot nested in the edited slot edits the nested one', async ({ page }) => {
  await clickText(page, 'Outer slot text')
  await expect(editingContainer(page)).toContainText('Outer slot text')

  await clickText(page, 'Nested slot,')

  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', 'default')
  await expect(editingContainer(page)).toContainText('Nested slot,')
  await expect(editingContainer(page)).not.toContainText('Outer slot text')
})

test('switching between named slots of the same component', async ({ page }) => {
  await clickText(page, 'Header slot')
  await expectEditing(page, 'header', 'Header slot')

  await clickText(page, 'Footer slot')
  await expectEditing(page, 'footer', 'Footer slot')
})

test('editing a slot keeps its rich content', async ({ page }) => {
  await clickText(page, 'bold')

  await expectEditing(page, 'default', 'Text with bold, italic and a link.')
  await expect(editingContainer(page).locator('b')).toHaveText('bold')
  await expect(editingContainer(page).locator('a')).toHaveText('link')
})

test('clicking a fallback edits the empty slot', async ({ page }) => {
  await clickText(page, 'Fallback content, nothing was passed')

  await expectEditing(page, 'default', '')
  await expect(canvas(page).getByText('Fallback content, nothing was passed')).toHaveCount(0)
})

test('a slot with content replaces its fallback', async ({ page }) => {
  await clickText(page, 'Content passed, fallback replaced.')

  await expectEditing(page, 'default', 'Content passed, fallback replaced.')
})

test('clicking an empty slot edits it', async ({ page }) => {
  await canvas(page)
    .getByText('EmptySlot', { exact: true })
    .locator('xpath=following-sibling::div')
    .click()

  await expectEditing(page, 'default', '')
})

test('a slot rendered behind v-if($slots.icon) is editable', async ({ page }) => {
  await clickText(page, '✦')

  await expectEditing(page, 'icon', '✦')
})

test('a slot toggled by a prop is editable when shown', async ({ page }) => {
  await clickText(page, 'Header, hidden when showHeader is off')
  await expectEditing(page, 'header', 'Header, hidden when showHeader is off')

  // showFooter defaults to false
  await expect(canvas(page).getByText('Footer, shown when showFooter is on')).toHaveCount(0)
})

test('a slot picked by v-if / v-else-if / v-else keeps its name', async ({ page }) => {
  // state defaults to 'ready'
  await expect(canvas(page).getByText('Loading slot')).toHaveCount(0)

  await clickText(page, 'Ready slot')

  await expectEditing(page, 'ready', 'Ready slot')
})

test('a repeated slot edits the clicked copy only', async ({ page }) => {
  const copies = canvas(page).locator('li', { hasText: 'Same slot rendered count times.' })
  await copies.nth(1).click()

  await expectEditing(page, 'default', 'Same slot rendered count times.')
  await expect(copies.nth(1).locator('[data-test=editing-container]')).toHaveCount(1)
})

test('switching between copies of a repeated slot', async ({ page }) => {
  const copies = canvas(page).locator('li', { hasText: 'Same slot rendered count times.' })
  await copies.nth(0).click()
  await expect(copies.nth(0).locator('[data-test=editing-container]')).toHaveCount(1)

  await copies.nth(2).click()

  await expectEditing(page, 'default', 'Same slot rendered count times.')
  await expect(copies.nth(2).locator('[data-test=editing-container]')).toHaveCount(1)
})

test('an inline slot inside a paragraph is editable', async ({ page }) => {
  await clickText(page, 'highlighted')

  await expectEditing(page, 'default', 'highlighted')
})

test('a slot in a multi-root component is editable', async ({ page }) => {
  await clickText(page, 'Slot in a component with several root nodes.')

  await expectEditing(page, 'default', 'Slot in a component with several root nodes.')
})

test('clicking the blank space next to a root-level slot text does not edit it', async ({
  page,
}) => {
  await clickText(page, 'Slot in a component with several root nodes.', { dx: 40 })

  // caretPositionFromPoint alone would snap to the text and edit the slot
  await expect(page.locator('[data-test=selection]')).toHaveCount(0)
  await expect(editingContainer(page)).toHaveCount(0)
})
