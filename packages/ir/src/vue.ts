import { kebabCase } from '@transient/core'
import JSON5 from 'json5'
import type {
  BindingInfo,
  TransientComponentDictionnary,
  TransientComponentSchema,
  TransientElement,
  TransientElementAttributes,
} from './definition.js'

export function irToSfc(
  ir: TransientComponentSchema,
  _dictionnary: TransientComponentDictionnary,
): string {
  const template = createTemplate(`root-${ir.tag}`, ir.template.elements)
  return elementToVueElement(template)
}

export function elementToVueElement(element: TransientElement): string {
  if (element.tag === '#text') {
    return toText(element.attributes?.value?.expression)
  }

  const attributes = []

  for (const [attribute, value] of Object.entries(element.attributes)) {
    attributes.push(toVueAttribute(element.isComponent ? kebabCase(attribute) : attribute, value))
  }

  const children: string[] = []

  for (const slotName in element.slots) {
    const slotContent = element.slots[slotName]
    if (!slotContent || slotContent?.length === 0) continue

    let childrenToRender = slotContent

    if (slotName !== 'default') {
      const template: TransientElement[] = [
        createTemplate(`template-${slotName}-${element.id}`, slotContent, slotName),
      ]
      childrenToRender = template
    }

    for (const child of childrenToRender) {
      children.push(elementToVueElement(child))
    }
  }

  let openTag = `<${element.tag}`
  if (attributes.length) {
    openTag += [' ', attributes.join(' ')].join('')
  }
  openTag += '>'

  const content = children.join('')

  const closeTag = `</${element.tag}>`

  return [openTag, content, closeTag].join('')
}

function createTemplate(
  id: string,
  content: TransientElement[],
  slotName?: string,
): TransientElement {
  const attributes: TransientElementAttributes = slotName ? { [`v-slot:${slotName}`]: null } : {}

  return {
    id,
    tag: 'template',
    isComponent: false,
    attributes,
    slots: {
      default: content,
    },
  }
}

function toVueAttribute(name: string, value: BindingInfo | null) {
  let directive: null | string = name.startsWith('v-') ? name : null

  let content = value?.expression ?? null

  if (value) {
    if (value.type === 'literal') {
      if (typeof value.expression === 'string') {
        content = escapeAttribute(value.expression)
      } else {
        directive = 'v-bind'
        content = JSON5.stringify(value.expression, { quote: "'" })
      }
    } else if (value.type === 'expression') {
      directive = 'v-bind'
    } else {
      throw new Error('unknown value type')
    }
  }

  return formatAttribute(directive, name, content)
}

function formatAttribute(
  directive: null | string,
  name: string,
  value: BindingInfo['expression'] | null,
) {
  let key = name

  if (directive) {
    if (directive.startsWith('v-bind')) {
      key = `:${name}`
    }

    if (directive.startsWith('v-slot')) {
      const elementSlot = name.slice('v-slot:'.length)
      key = `#${elementSlot}`
    }
  }

  if (value === null || value === undefined) {
    return key
  }

  return `${key}="${value}"`
}

// in an attribute value only " ends it, and & starts an entity
function escapeAttribute(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function toText(value: BindingInfo['expression']): string {
  return escapeHtml(String(value ?? ''))
}

// Fonction pour échapper les caractèresspéciaux HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
