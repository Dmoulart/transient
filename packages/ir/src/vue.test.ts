import { describe, expect, test } from 'bun:test'
import type { TransientComponentDictionnary, TransientElement } from './definition.js'
import { irToSfc } from './vue.js'

describe('vue', () => {
  const dictionnary: TransientComponentDictionnary = {
    Comp: {
      path: '/some/path/Comp.vue',
      props: {},
      tag: 'Comp',
      template: {
        elements: [
          {
            id: '1',
            tag: 'div',
            isComponent: false,
            attributes: {
              class: {
                type: 'literal',
                expression: 'hero-section',
              },
            },
            slots: {
              default: [
                {
                  id: '2',
                  tag: '#text',
                  isComponent: false,
                  attributes: {
                    value: {
                      type: 'literal',
                      expression: 'Hello',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      slots: {},
    },
  }

  test('irToSfc', () => {
    const Comp = dictionnary.Comp!
    const sfc = irToSfc(Comp, dictionnary)
    expect(sfc).toEqual(`<template><div class="hero-section">Hello</div></template>`)
  })

  test('keeps named slots', () => {
    const card = element('Card', {}, { default: [text('Body')], header: [text('Title')] })
    card.isComponent = true
    expect(irToSfc(schema([card]), dictionnary)).toEqual(
      `<template><Card>Body<template #header>Title</template></Card></template>`,
    )
  })

  test('escapes quotes in attributes', () => {
    const div = element('div', { title: 'say "hi"' })
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div title="say &quot;hi&quot;"></div></template>`,
    )
  })

  test('keeps line breaks of a static attribute', () => {
    const div = element('div', { class: 'flex\n  gap-2' })
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div class="flex\n  gap-2"></div></template>`,
    )
  })

  test('keeps backslashes of a static attribute', () => {
    const div = element('div', { pattern: 'C:\\dir' })
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div pattern="C:\\dir"></div></template>`,
    )
  })

  test('serializes lists and objects as readable js literals', () => {
    const div = element('div', {})
    div.attributes.images = {
      type: 'literal',
      expression: [{ src: '/a.jpg', caption: "L'Oiseau" }],
    }
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div :images="[{src:'/a.jpg',caption:'L\\'Oiseau'}]"></div></template>`,
    )
  })

  test('writes a prop binding back', () => {
    const div = element('div', {})
    div.attributes.label = { type: 'expression', expression: 'title' }
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div :label="title"></div></template>`,
    )
  })

  test('writes component attributes kebab-case', () => {
    const hero = element('Hero', { bgImage: '/a.jpg' })
    hero.isComponent = true
    const svg = element('svg', { viewBox: '0 0 1 1' })
    expect(irToSfc(schema([hero, svg]), dictionnary)).toEqual(
      `<template><Hero bg-image="/a.jpg"></Hero><svg viewBox="0 0 1 1"></svg></template>`,
    )
  })

  test('binds non-string literals', () => {
    const div = element('div', { count: 3, disabled: true })
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div :count="3" :disabled="true"></div></template>`,
    )
  })

  // '' is an attribute without value: <button disabled>, not disabled="" or :disabled="true"
  test('writes an attribute without value bare', () => {
    const button = element('button', {})
    button.attributes.disabled = { type: 'literal', expression: '' }
    expect(irToSfc(schema([button]), dictionnary)).toEqual(
      `<template><button disabled></button></template>`,
    )
  })

  test('escapes text so it is never interpolated', () => {
    const div = element('div', {}, { default: [text('{{ secret }} & a < b')] })
    expect(irToSfc(schema([div]), dictionnary)).toEqual(
      `<template><div>&#123;&#123; secret &#125;&#125; &amp; a &lt; b</div></template>`,
    )
  })
})

function schema(elements: TransientElement[]) {
  return { path: '/some/path/Test.vue', props: {}, tag: 'Test', template: { elements } }
}

function element(
  tag: string,
  literals: Record<string, string | number | boolean>,
  slots?: Record<string, TransientElement[]>,
): TransientElement {
  const attributes: TransientElement['attributes'] = {}
  for (const [name, expression] of Object.entries(literals)) {
    attributes[name] = { type: 'literal', expression }
  }
  return { id: tag, tag, isComponent: false, attributes, slots }
}

function text(value: string): TransientElement {
  return {
    id: value,
    tag: '#text',
    isComponent: false,
    attributes: { value: { type: 'literal', expression: value } },
  }
}
