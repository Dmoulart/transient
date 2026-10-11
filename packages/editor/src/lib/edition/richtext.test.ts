import { describe, expect, test } from 'bun:test'
import type { JSONContent } from '@tiptap/vue-3'
import type { TransientElement } from 'transient'
import { pmContentToTransientElements } from './richtext'

// --- builders: the slot as it was before editing, and what ProseMirror hands back ---

const el = (
  id: string,
  tag: string,
  children: TransientElement[] = [],
  attributes: TransientElement['attributes'] = {},
): TransientElement => ({ id, tag, isComponent: false, attributes, slots: { default: children } })

const text = (id: string, value: string): TransientElement => ({
  id,
  tag: '#text',
  isComponent: false,
  attributes: { value: { type: 'literal', expression: value } },
})

const component = (id: string, tag: string): TransientElement => ({
  id,
  tag,
  isComponent: true,
  attributes: {},
})

// the container whose slot is being edited: ids are looked up in it
const container = (...children: TransientElement[]) => el('container', 'div', children)

const doc = (...content: JSONContent[]): JSONContent => ({ type: 'doc', content })
// the element's attributes travel in the mark, as plain strings (see toPMInline)
const mark = (id: string, tag: string, attributes: Record<string, string> = {}) => ({
  type: 'inlineElement',
  attrs: { id, tag, attributes },
})
const t = (value: string, ...marks: ReturnType<typeof mark>[]): JSONContent =>
  marks.length ? { type: 'text', text: value, marks } : { type: 'text', text: value }
const island = (id: string): JSONContent => ({ type: 'island', attrs: { id } })

// text ids are regenerated on every capture: compare the shape, as markup with element ids.
// An id the original slot doesn't have prints as #new: a split element must not reuse its id
function html(elements: TransientElement[], known: Set<string>): string {
  return elements
    .map((element) => {
      if (element.tag === '#text') return String(element.attributes.value?.expression)
      const id = known.has(element.id) ? element.id : 'new'
      if (element.isComponent) return `<${element.tag}#${id}/>`
      const attrs = Object.entries(element.attributes)
        .map(([name, { expression }]) => ` ${name}="${expression}"`)
        .join('')
      return `<${element.tag}#${id}${attrs}>${html(element.slots?.default ?? [], known)}</${element.tag}>`
    })
    .join('')
}

function ids(elements: TransientElement[]): string[] {
  return elements.flatMap((element) => [element.id, ...ids(element.slots?.default ?? [])])
}

const capture = (pm: JSONContent, original: TransientElement) =>
  html(pmContentToTransientElements(pm, original), new Set(ids([original])))

describe('pmContentToTransientElements', () => {
  test('plain text', () => {
    expect(capture(doc(t('Hello')), container(text('t1', 'Hello')))).toBe('Hello')
  })

  test('a mark becomes the element it came from, with its attributes', () => {
    const style = { style: { type: 'literal' as const, expression: 'color: crimson' } }
    const original = container(el('s', 'strong', [text('t1', 'red')], style))

    const pm = doc(t('red', mark('s', 'strong', { style: 'color: crimson' })))

    expect(capture(pm, original)).toBe(
      '<strong#s style="color: crimson">red</strong>',
    )
  })

  test('neighbour texts sharing a mark end up in one element', () => {
    // <strong>Crimson <em>emphasis</em></strong>: the e2e regression
    const original = container(
      el('s', 'strong', [text('t1', 'Crimson '), el('e', 'em', [text('t2', 'emphasis')])]),
    )

    const pm = doc(
      t('Crimson ', mark('s', 'strong')),
      t('emphasis', mark('s', 'strong'), mark('e', 'em')),
    )

    expect(capture(pm, original)).toBe('<strong#s>Crimson <em#e>emphasis</em></strong>')
  })

  test('an inner element closes and the outer one goes on', () => {
    const original = container(
      el('s', 'strong', [text('t1', 'a'), el('e', 'em', [text('t2', 'b')]), text('t3', 'c')]),
    )

    const pm = doc(
      t('a', mark('s', 'strong')),
      t('b', mark('s', 'strong'), mark('e', 'em')),
      t('c', mark('s', 'strong')),
    )

    expect(capture(pm, original)).toBe('<strong#s>a<em#e>b</em>c</strong>')
  })

  test('identical neighbours stay two elements', () => {
    const original = container(
      el('a', 'span', [text('t1', 'twin')]),
      el('b', 'span', [text('t2', 'twin')]),
    )

    const pm = doc(t('twin', mark('a', 'span')), t('twin', mark('b', 'span')))

    expect(capture(pm, original)).toBe('<span#a>twin</span><span#b>twin</span>')
  })

  test('text outside any mark sits between elements', () => {
    const original = container(
      el('s', 'strong', [text('t1', 'bold')]),
      text('t2', ' and '),
      el('e', 'em', [text('t3', 'italic')]),
    )

    const pm = doc(t('bold', mark('s', 'strong')), t(' and '), t('italic', mark('e', 'em')))

    expect(capture(pm, original)).toBe('<strong#s>bold</strong> and <em#e>italic</em>')
  })

  test('an island is kept as the original component', () => {
    const original = container(text('t1', 'Count: '), component('c', 'Counter'), text('t2', '!'))

    const pm = doc(t('Count: '), island('c'), t('!'))

    expect(capture(pm, original)).toBe('Count: <Counter#c/>!')
  })

  // the stack of open elements: a mark only continues the element open at the same depth

  test('an element split in two by plain text gives two elements, in order', () => {
    // the user removed the bold in the middle of <strong>abc</strong>
    const original = container(el('s', 'strong', [text('t1', 'abc')]))

    const pm = doc(t('a', mark('s', 'strong')), t('b'), t('c', mark('s', 'strong')))

    expect(capture(pm, original)).toBe('<strong#s>a</strong>b<strong#new>c</strong>')
  })

  test('an inner mark outliving its outer one leaves the outer element', () => {
    const original = container(el('s', 'strong', [el('e', 'em', [text('t1', 'ab')])]))

    const pm = doc(t('a', mark('s', 'strong'), mark('e', 'em')), t('b', mark('e', 'em')))

    expect(capture(pm, original)).toBe('<strong#s><em#e>a</em></strong><em#new>b</em>')
  })

  test('an inner element closed by a sibling does not reopen', () => {
    const original = container(
      el('s', 'strong', [
        el('e', 'em', [text('t1', 'a')]),
        el('u', 'u', [text('t2', 'b')]),
        text('t3', 'c'),
      ]),
    )

    // c is italic again after the underline: a new <em>, after the <u>
    const pm = doc(
      t('a', mark('s', 'strong'), mark('e', 'em')),
      t('b', mark('s', 'strong'), mark('u', 'u')),
      t('c', mark('s', 'strong'), mark('e', 'em')),
    )

    expect(capture(pm, original)).toBe(
      '<strong#s><em#e>a</em><u#u>b</u><em#new>c</em></strong>',
    )
  })
})
