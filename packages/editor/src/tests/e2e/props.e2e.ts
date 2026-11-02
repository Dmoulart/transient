import { expect, type Page, test } from '@playwright/test'
import { canvas } from './helpers'

// spec: one field per prop kind (Props/AllProps.vue), each change reaches the component

// AllProps prints its own $props: what the panel sets is what the component receives
const rendered = async (page: Page) =>
  JSON.parse((await canvas(page).locator('pre').textContent()) ?? '{}')

const expectProp = (page: Page, name: string, value: unknown) =>
  expect.poll(async () => (await rendered(page))[name]).toEqual(value)

const prop = (page: Page, name: string) => page.locator(`[data-test=prop][data-prop=${name}]`)
const field = (page: Page, name: string) => prop(page, name).locator('[data-field]')

test.beforeEach(async ({ page }) => {
  await page.goto('/?page=Props&debug=false')
  await canvas(page).locator('pre').click()
})

test('string: typing sets the prop', async ({ page }) => {
  await field(page, 'text').fill('Hello world')

  await expectProp(page, 'text', 'Hello world')
})

test('string: shows the default value', async ({ page }) => {
  await expect(field(page, 'withDefault')).toHaveValue('Hello')
})

test('boolean: the switch toggles the prop', async ({ page }) => {
  await expectProp(page, 'enabled', true)
  await field(page, 'enabled').click()

  await expectProp(page, 'enabled', false)
})

test('decimal: typing a number sets the prop', async ({ page }) => {
  await field(page, 'count').fill('7')
  await field(page, 'count').press('Enter')

  await expectProp(page, 'count', 7)
})

test('decimal: + increments from the default', async ({ page }) => {
  await prop(page, 'count').locator('[data-action=increment]').click()

  await expectProp(page, 'count', 4)
})

test('enum ≤ 4 options: the segmented control sets the prop', async ({ page }) => {
  await expect(field(page, 'align')).toHaveAttribute('data-field', 'toggle')
  await prop(page, 'align').locator('[data-option=left]').click()

  await expectProp(page, 'align', 'left')
})

test('numeric enum keeps the number type', async ({ page }) => {
  await prop(page, 'level').locator('[data-option="3"]').click()

  await expectProp(page, 'level', 3)
})

test('enum > 4 options: the select sets the prop', async ({ page }) => {
  await expect(field(page, 'weight')).toHaveAttribute('data-field', 'select')
  await field(page, 'weight').click()
  await page.locator('[role=option][data-option=bold]').click()

  await expectProp(page, 'weight', 'bold')
})

test('select: an empty string option can be picked', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))

  await field(page, 'size').click()
  await page.locator('[role=option][data-option=sm]').click()
  await expectProp(page, 'size', 'sm')

  await field(page, 'size').click()
  await page.locator('[role=option][data-option=""]').click()
  await expectProp(page, 'size', '')

  expect(errors).toEqual([])
})

test('other types fall back to a raw expression', async ({ page }) => {
  for (const name of ['width', 'position', 'tags', 'links', 'attrs', 'formatter', 'date']) {
    await expect(field(page, name)).toHaveAttribute('data-field', 'expression')
  }
})

test('kebab-case attribute is read back by the panel (camelCase prop)', async ({ page }) => {
  await expect(field(page, 'someValue')).toHaveValue('From kebab')
})
