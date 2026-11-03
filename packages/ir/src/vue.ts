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
    if (element.attributes?.value?.type === 'prop') {
      throw new Error('not implemented')
    }
    return toText(element.attributes?.value?.expression)
  }

  const attributes = []

  for (const attribute in element.attributes) {
    const value = element.attributes[attribute]!
    attributes.push(toVueAttribute(attribute, value))
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
  const attributes: TransientElementAttributes = slotName
    ? { [`v-slot:${slotName}`]: { type: 'directive', expression: undefined } }
    : {}

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

function toVueAttribute(name: string, value: BindingInfo) {
  if (value.type === 'literal') {
    if (typeof value.expression !== 'string') {
      return `:${name}="${value?.expression}"`
    }

    return `${name}="${toText(value?.expression)}"`
  } else if (value.type === 'directive') {
    if (value.expression !== undefined) {
      return `${name}="${value.expression}"`
    } else {
      if (name.startsWith('v-slot:')) {
        const elementSlot = name.slice('v-slot:'.length)
        return `#${elementSlot}`
      }
    }
  } else {
    // todo is prop type used ?
    throw new Error('Not implemented')
  }
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
