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
})
