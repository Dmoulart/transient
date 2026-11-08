import { describe, expect, test } from 'bun:test'
import { type ElementNode, parse } from '@vue/compiler-dom'
import { parseElementAttributes } from './template.js'

function attributesOf(template: string) {
  const element = parse(template).children[0] as ElementNode
  return parseElementAttributes(element.props, { title: { type: 'string' } })
}

describe('template attributes', () => {
  // :size="20" used to become a `bind:size` attribute: Picto never got its prop
  test('v-bind is keyed by its argument', () => {
    expect(attributesOf(`<Picto icon="phone" :size="20" :label="title" />`)).toEqual({
      icon: { type: 'literal', expression: 'phone' },
      size: { type: 'literal', expression: 20 },
      label: { type: 'prop', expression: 'title' },
    })
  })

  test('a boolean is a literal', () => {
    expect(attributesOf(`<Comp :on="true" :off="false" />`)).toEqual({
      on: { type: 'literal', expression: true },
      off: { type: 'literal', expression: false },
    })
  })

  test('a number is a literal', () => {
    expect(attributesOf(`<Comp :size="20" :ratio="-1.5" />`)).toEqual({
      size: { type: 'literal', expression: 20 },
      ratio: { type: 'literal', expression: -1.5 },
    })
  })

  test('a string is a literal, bound or not', () => {
    expect(attributesOf(`<Comp label="Hello" :bound="'Hello'" />`)).toEqual({
      label: { type: 'literal', expression: 'Hello' },
      bound: { type: 'literal', expression: 'Hello' },
    })
  })

  test('an object is a literal', () => {
    expect(attributesOf(`<Comp :position="{ x: 1, y: 2 }" />`)).toEqual({
      position: { type: 'literal', expression: { x: 1, y: 2 } },
    })
  })

  test('a js list is coerced to JSON', () => {
    const template = `<Gallery :images="[{ src: '/a.jpg', caption: 'L\\'Oiseau' }]" />`
    expect(attributesOf(template)).toEqual({
      images: { type: 'literal', expression: [{ src: '/a.jpg', caption: "L'Oiseau" }] },
    })
  })

  test('a declared prop is a prop', () => {
    expect(attributesOf(`<Comp :label="title" />`)).toEqual({
      label: { type: 'prop', expression: 'title' },
    })
  })

  test('anything else is an expression, kept as its source', () => {
    expect(attributesOf(`<Comp :label="title.toUpperCase()" />`)).toEqual({
      label: { type: 'expression', expression: 'title.toUpperCase()' },
    })
  })
})
