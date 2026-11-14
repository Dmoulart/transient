import { expect, type Page, test } from '@playwright/test'
import { canvas, clickText } from './helpers'

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

test('clicking a default slot starts editing', async ({ page }) => {
  await page.getByText('Plain text in the default slot.').click()

  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', 'default')
  await expect(editingContainer(page)).toHaveText('Plain text in the default slot.')
})

test('clicking a named slot starts editing it', async ({ page }) => {
  await page.getByText('Footer slot').click()

  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', 'footer')
  await expect(editingContainer(page)).toHaveText('Footer slot')
})

test('clicking a slot nested in the editing slot starts editing the nested one', async ({
  page,
}) => {
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

test('starting to edit a slot keeps its rich content', async ({ page }) => {
  await clickText(page, 'bold')

  await expectEditing(page, 'default', 'Text with bold, italic and a link.')
  await expect(editingContainer(page).locator('b')).toHaveText('bold')
  await expect(editingContainer(page).locator('a')).toHaveText('link')
})

test('clicking a fallback starts editing the empty slot', async ({ page }) => {
  await clickText(page, 'Fallback content, nothing was passed')

  await expectEditing(page, 'default', '')
  await expect(canvas(page).getByText('Fallback content, nothing was passed')).toHaveCount(0)
})

test('clicking an empty slot starts editing it', async ({ page }) => {
  await canvas(page)
    .getByText('EmptySlot', { exact: true })
    .locator('xpath=following-sibling::div')
    .click()

  await expectEditing(page, 'default', '')
})

test('a slot rendered behind v-if($slots.icon) can start editing', async ({ page }) => {
  await clickText(page, '✦')

  await expectEditing(page, 'icon', '✦')
})

test('a slot picked by v-if / v-else-if / v-else keeps its name', async ({ page }) => {
  // state defaults to 'ready'
  await expect(canvas(page).getByText('Loading slot')).toHaveCount(0)

  await clickText(page, 'Ready slot')

  await expectEditing(page, 'ready', 'Ready slot')
})

test('clicking a repeated slot starts editing the clicked copy only', async ({ page }) => {
  const copies = canvas(page).locator('li', { hasText: 'Same slot rendered count times.' })
  await copies.nth(1).click()

  await expectEditing(page, 'default', 'Same slot rendered count times.')
  await expect(copies.nth(1)).toHaveAttribute('data-test', 'editing-container')
})

test('switching between copies of a repeated slot', async ({ page }) => {
  const copies = canvas(page).locator('li', { hasText: 'Same slot rendered count times.' })
  await copies.nth(0).click()
  await expect(copies.nth(0)).toHaveAttribute('data-test', 'editing-container')

  await copies.nth(2).click()

  await expectEditing(page, 'default', 'Same slot rendered count times.')
  await expect(copies.nth(2)).toHaveAttribute('data-test', 'editing-container')
})

test('an inline slot inside a paragraph can start editing', async ({ page }) => {
  await clickText(page, 'highlighted')

  await expectEditing(page, 'default', 'highlighted')
})

test('a slot in a multi-root component can start editing', async ({ page }) => {
  await clickText(page, 'Slot in a component with several root nodes.')

  await expectEditing(page, 'default', 'Slot in a component with several root nodes.')
})

test('clicking the blank space next to a root-level slot text does not start editing', async ({
  page,
}) => {
  await clickText(page, 'Slot in a component with several root nodes.', { dx: 40 })

  // caretPositionFromPoint alone would snap to the text and start editing the slot
  await expect(page.locator('[data-test=selection]')).toHaveCount(0)
  await expect(editingContainer(page)).toHaveCount(0)
})

// focusout is what commits the edit: click outside the canvas, like a user would
async function stopEditing(page: Page) {
  await page.mouse.click(1, 1)
  await expect(editingContainer(page)).toHaveCount(0)
}

test('typing in a slot replaces its content once editing stops', async ({ page }) => {
  await clickText(page, 'Plain text in the default slot.')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Brand new text')
  await stopEditing(page)

  await expect(canvas(page).getByText('Brand new text')).toHaveCount(1)
  await expect(canvas(page).getByText('Plain text in the default slot.')).toHaveCount(0)
})

test('a click right after the end of a text puts the caret there', async ({ page }) => {
  await page.getByText('Plain text in the default slot.').waitFor()
  // on the slot's own line, past its last character
  const end = await canvas(page)
    .getByText('Plain text in the default slot.')
    .evaluate((slot) => {
      const range = document.createRange()
      range.selectNodeContents(slot)
      const { right, y, height } = range.getBoundingClientRect()
      return { x: right + 40, y: y + height / 2 }
    })
  await page.mouse.click(end.x, end.y)
  await expect(editingContainer(page)).toHaveCount(1)
  await page.keyboard.type('Z')
  await stopEditing(page)

  await expect(canvas(page).getByText('Plain text in the default slot.Z')).toHaveCount(1)
})

// the clipboard serializes the selection: an island had no HTML rendering and threw
test('cutting a selection that holds a component does not throw', async ({ page }) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))

  await clickText(page, 'Island to cut:')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('ControlOrMeta+x')

  await expect(editingContainer(page)).not.toContainText('Island to cut:')
  expect(errors).toEqual([])
})

test('editing a named slot leaves its sibling slots untouched', async ({ page }) => {
  await clickText(page, 'Header slot')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('New header')
  await stopEditing(page)

  await expect(canvas(page).getByText('New header')).toHaveCount(1)
  await expect(canvas(page).getByText('Default slot between two named slots.')).toHaveCount(1)
  await expect(canvas(page).getByText('Footer slot')).toHaveCount(1)
})

test('typing inside rich content keeps its formatting once editing stops', async ({ page }) => {
  // the click puts the caret inside the bold text
  await clickText(page, 'bold')
  await page.keyboard.type('!')
  await stopEditing(page)

  const slot = canvas(page).getByText('Text with bo!ld, italic and a link.')
  await expect(slot.locator('b, strong')).toHaveText('bo!ld')
  await expect(slot.locator('a')).toHaveText('link')
})

// nested inline elements, an inline style and identical neighbours: what the flat marks
// of the editor have to rebuild exactly
const nestedFormatting = (page: Page) => canvas(page).getByText(/^Crimson .* next to twintwin\.$/)

test('leaving a slot without typing keeps its markup as is', async ({ page }) => {
  const before = await nestedFormatting(page).innerHTML()

  await clickText(page, 'Crimson')
  await stopEditing(page)

  expect(await nestedFormatting(page).innerHTML()).toBe(before)
})

// the content is rebuilt from the editor, with new text ids: that alone is not a change
test('leaving a slot without typing is not an edit', async ({ page }) => {
  const undo = page.getByRole('button', { name: 'Annuler' })

  await clickText(page, 'Crimson')
  await stopEditing(page)
  await expect(undo).toBeDisabled()

  await clickText(page, 'Crimson')
  await page.keyboard.type('X')
  await stopEditing(page)
  await expect(undo).toBeEnabled()
})

test('typing inside nested formatting keeps the nesting', async ({ page }) => {
  await clickText(page, 'emphasis')
  await page.keyboard.type('X')
  await stopEditing(page)

  const strong = nestedFormatting(page).locator('strong')
  await expect(strong).toHaveCount(1)
  await expect(strong).toHaveAttribute('style', /color: crimson/)
  await expect(strong.locator('em')).toContainText('X')
})

// --- a slot sharing its element with what the component renders around it: the editor
// mounts on that element, and its other children must come through untouched

test('typing in an empty slot fills it', async ({ page }) => {
  await canvas(page)
    .getByText('EmptySlot', { exact: true })
    .locator('xpath=following-sibling::div')
    .click()
  await page.keyboard.type('Filled')
  await stopEditing(page)

  await expect(canvas(page).getByText('Filled')).toHaveCount(1)
})

test('editing a slot leaves the slots sharing its element untouched', async ({ page }) => {
  await clickText(page, 'Sibling body')
  // no wrapper: the element being edited is the one holding the three slots
  await expect(editingContainer(page)).toContainText('Sibling header')
  await expect(editingFrame(page)).toHaveAttribute('data-slot-name', 'default')

  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('New body')
  await stopEditing(page)

  const box = canvas(page)
    .locator('div', { has: page.getByText('Sibling header') })
    .last()
  await expect(box.locator('> *')).toHaveText(['Sibling header', 'New body', 'Sibling footer'])
})

test('deleting everything in a slot leaves the title next to it', async ({ page }) => {
  await clickText(page, 'Text under the title.')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('Delete')

  await expect(editingContainer(page)).toHaveText('Kept title')

  await stopEditing(page)

  await expect(canvas(page).getByText('Kept title')).toHaveCount(1)
  await expect(canvas(page).getByText('Text under the title.')).toHaveCount(0)
})

test('a sibling that re-renders while the slot is edited does not leak into it', async ({
  page,
}) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  const blink = canvas(page).locator('[data-test=blink]')

  await clickText(page, 'Text next to a blinking sibling.')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Edited next to a blink')
  // several blinks' worth
  await page.waitForTimeout(600)
  await stopEditing(page)

  await expect(canvas(page).getByText('Edited next to a blink')).toHaveText(
    'Edited next to a blink',
  )
  expect(await blink.count()).toBeLessThanOrEqual(1)
  // and it blinks again
  await expect(blink).toHaveCount(0)
  await expect(blink).toHaveCount(1)
  expect(errors).toEqual([])
})

test('a slot next to text of its component is edited on its own', async ({ page }) => {
  await clickText(page, 'labelled value')
  // the label is not in the edited element: typing can't reach it
  await expectEditing(page, 'default', 'labelled value')

  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('new value')
  await stopEditing(page)

  await expect(canvas(page).getByText('Label: new value')).toHaveCount(1)
})
