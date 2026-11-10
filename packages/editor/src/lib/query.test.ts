import { describe, expect, test } from 'bun:test'
import type {
  TransientComponentDictionnary,
  TransientElement,
  TransientElementAttributes,
} from '@transient/ir'
import { query } from './query'

// --- builders ---

const el = (
  id: string,
  tag: string,
  slots: Record<string, TransientElement[]> = {},
  attributes: TransientElementAttributes = {},
): TransientElement => ({ id, tag, isComponent: false, attributes, slots })

const component = (
  id: string,
  tag: string,
  slots: Record<string, TransientElement[]> = {},
  attributes: TransientElementAttributes = {},
): TransientElement => ({ ...el(id, tag, slots, attributes), isComponent: true })

const text = (id: string, value: string): TransientElement => ({
  id,
  tag: '#text',
  isComponent: false,
  attributes: { value: { type: 'literal', expression: value } },
})

const attr = (expression: string) => ({ type: 'literal' as const, expression })

const schema = (tag: string, path: string) => ({ tag, path, props: {}, template: { elements: [] } })

const dictionnary: TransientComponentDictionnary = {
  Hero: schema('Hero', 'components/sections/Hero.vue'),
  Grid: schema('Grid', 'components/layout/Grid.vue'),
  Card: schema('Card', 'components/blocks/Card.vue'),
  Banner: schema('Banner', 'components/blocks/Banner.vue'),
}

// Hero
// Grid
//   default: Card#card-1, div > Card#card-2
//   header:  Banner[variant=danger]
// p > "hello"
const elements: TransientElement[] = [
  component('hero', 'Hero'),
  component('grid', 'Grid', {
    default: [
      component('card-1', 'Card'),
      el('wrapper', 'div', { default: [component('card-2', 'Card')] }),
    ],
    header: [component('banner', 'Banner', {}, { variant: attr('danger') })],
  }),
  el('p', 'p', { default: [text('text', 'hello')] }),
]

const ids = (selector: string) => query(selector, elements, dictionnary).map(({ id }) => id)

describe('tag', () => {
  test('matches by tag, case sensitive', () => {
    expect(ids('Hero')).toEqual(['hero'])
    expect(ids('hero')).toEqual([])
  })

  test('selector list', () => {
    expect(ids('Hero, Banner')).toEqual(['hero', 'banner'])
  })

  test('nested elements are reached through every slot', () => {
    expect(ids('Card')).toEqual(['card-1', 'card-2'])
  })

  test('text nodes are never matched', () => {
    expect(ids('*')).not.toContain('text')
  })
})

describe('combinators', () => {
  test('child', () => {
    expect(ids('Grid > Card')).toEqual(['card-1'])
  })

  test('descendant', () => {
    expect(ids('Grid Card')).toEqual(['card-1', 'card-2'])
  })

  test('siblings share a slot', () => {
    expect(ids('Card + div')).toEqual(['wrapper'])
    // Banner lives in another slot of Grid: not a sibling of the cards
    expect(ids('Card ~ Banner')).toEqual([])
  })

  test(':not', () => {
    expect(ids('Grid > :not(Card)')).toEqual(['wrapper', 'banner'])
  })
})

describe('attributes', () => {
  test('presence', () => {
    expect(ids('[variant]')).toEqual(['banner'])
  })

  test('value is matched on the expression', () => {
    expect(ids('[variant=danger]')).toEqual(['banner'])
    expect(ids('[variant^=dan]')).toEqual(['banner'])
    expect(ids('[variant=info]')).toEqual([])
  })
})

describe('element and schema fields as attributes', () => {
  test('[path] matches the component path', () => {
    expect(ids('[path^="components/blocks/"]')).toEqual(['card-1', 'card-2', 'banner'])
    expect(ids('[path$="/Hero.vue"]')).toEqual(['hero'])
  })

  test('plain elements have no path', () => {
    expect(ids('[path]')).toEqual(['hero', 'grid', 'card-1', 'card-2', 'banner'])
  })

  test('[isComponent]', () => {
    expect(ids('Grid [isComponent=false]')).toEqual(['wrapper'])
  })

  test(':path matches a glob', () => {
    expect(ids(':path("components/**")')).toEqual(['hero', 'grid', 'card-1', 'card-2', 'banner'])
    expect(ids(':path("components/blocks/*")')).toEqual(['card-1', 'card-2', 'banner'])
    // * stops at a folder
    expect(ids(':path("components/*")')).toEqual([])
    expect(ids(':path("**/{Hero,Grid}.vue")')).toEqual(['hero', 'grid'])
    expect(ids('Grid > :not(:path("**/Card.vue"))')).toEqual(['wrapper', 'banner'])
  })

  test('[id]', () => {
    expect(ids('[id=card-2]')).toEqual(['card-2'])
  })
})
