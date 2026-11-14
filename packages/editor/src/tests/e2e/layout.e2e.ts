import { expect, type Page, test } from '@playwright/test'
import { canvas, clickText } from './helpers'

// spec: entering edit mode does not move the slot's content, whatever it holds (Layout.vue)

// the DefaultSlot box holding `text` and every visible character in it, relative to the
// canvas (clickText scrolls). Not the slot's own <div>: editing replaces it, and inline text
// between blocks gets a <div> of its own. Per character: blind to how ProseMirror splits
// its text nodes, but an added space, line break or margin moves something
async function layout(page: Page, text: string) {
  const slot = canvas(page).locator('div.rounded-xl', { hasText: text })
  return slot.evaluate((slot) => {
    const origin = document.querySelector('[data-test=canvas]')!.getBoundingClientRect()
    const rel = (r: DOMRect) =>
      [r.x - origin.x, r.y - origin.y, r.width, r.height].map(Math.round).join(',')
    const chars: string[] = []
    const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (let i = 0; i < node.textContent!.length; i++) {
        const char = node.textContent![i]!
        if (!char.trim()) continue // collapsed whitespace has no box
        const range = document.createRange()
        range.setStart(node, i)
        range.setEnd(node, i + 1)
        chars.push(`${char}@${rel(range.getBoundingClientRect())}`)
      }
    }
    return { box: rel(slot.getBoundingClientRect()), chars }
  })
}

const visible = (chars: string[]) => chars.map((char) => char[0]).join('')

// click: a text the slot's first text node starts with. all: the slot's visible text
const cases = [
  { name: 'inline', click: 'Inline text with', all: 'Inline text with bold, italic and a link.' },
  {
    name: 'inline, indented template',
    click: 'Indented template text',
    all: 'Indented template text spread over several lines.',
  },
  {
    name: 'blocks',
    click: 'Blocks heading',
    all: 'Blocks heading First paragraph. Second paragraph.',
  },
  {
    name: 'blocks, indented template',
    click: 'Indented heading',
    all: 'Indented heading Indented paragraph.',
  },
  { name: 'nested blocks', click: 'List item one', all: 'List item one List item two' },
  {
    name: 'inline and blocks',
    click: 'Loose text before',
    all: 'Loose text before a paragraph in between loose text after.',
  },
  {
    name: 'blocks around a component',
    click: 'Paragraph above the tile.',
    all: 'Paragraph above the tile. Tile between Paragraph below.',
  },
  // the slot's element is inline: a line break added in it would split the paragraph
  {
    name: 'inline slot in a paragraph',
    click: 'inline slot',
    all: 'An inline slot inside a paragraph.',
  },
  // the slot shares its parent with a title: `h2 + p` and `text-align: justify` must hold
  {
    name: 'blocks next to a sibling outside the slot',
    click: 'Paragraph right after the title.',
    all: 'Titled Paragraph right after the title. A justified paragraph that wraps over several lines.',
  },
]

test.beforeEach(async ({ page }) => {
  await page.goto('/?page=Layout&debug=false')
})

for (const { name, click, all } of cases) {
  test(`entering edit mode does not move the slot content: ${name}`, async ({ page }) => {
    const before = await layout(page, click)
    // guards against measuring the wrong box
    expect(visible(before.chars)).toContain(all.replaceAll(' ', ''))

    await clickText(page, click)
    await expect(page.locator('[data-test=editing-container]')).toHaveCount(1)

    expect(await layout(page, click)).toEqual(before)
  })
}
