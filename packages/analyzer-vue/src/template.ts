import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import { assertIs, pascalCase, someString } from '@transient/core'
import type {
  BindingInfo,
  TransientElement,
  TransientProps,
  TransientTemplate,
} from '@transient/ir'
import {
  type AttributeNode,
  type DirectiveNode,
  type ElementNode,
  ElementTypes,
  NodeTypes,
  parse as parseTemplate,
  type TemplateChildNode,
  type TextNode,
} from '@vue/compiler-dom'
import { parse as parseSFC } from '@vue/compiler-sfc'
import JSON5 from 'json5'

export function analyzeTemplateElements(
  componentPath: string,
  props: TransientProps,
): TransientTemplate {
  const source = readFileSync(componentPath, 'utf-8')
  const sfc = parseSFC(source)

  const template = sfc.descriptor.template?.content

  if (!template) return { elements: [] }

  const ast = parseTemplate(template)

  const elements = ast.children
    .map((node) => walk(node, props))
    .filter(Boolean) as TransientElement[]

  return { elements }
}

function walk(node: TemplateChildNode, props: TransientProps): TransientElement | null {
  let el: TransientElement | null = null

  switch (node.type) {
    case NodeTypes.TEXT:
      el = parseText(node)
      break
    case NodeTypes.ELEMENT:
      el = parseElement(node, props)
      break
  }

  // if (node.type === NodeTypes.INTERPOLATION) {
  //   if ("content" in node.content) {
  //     return {
  //       tag: "#text",
  //       isComponent: false,
  //       attributes: {
  //         value: { type: "prop", expression: node.content.content.trim() },
  //       },
  //     };
  //   }
  //   // not implemented
  //   return null;
  // }

  // Handle named slots defined via <template #slotName> or <template v-slot:slotName>

  return el
}

function parseText(node: TextNode): TransientElement | null {
  const content = node.content

  if (!content) return null

  return {
    id: crypto.randomUUID(),
    tag: '#text',
    isComponent: false,
    attributes: {
      value: { type: 'literal', expression: content },
    },
  }
}

function parseElement(node: ElementNode, props: TransientProps): TransientElement | null {
  const isComponent = node.tagType === ElementTypes.COMPONENT

  const tag = isComponent ? pascalCase(node.tag) : node.tag

  const attributes = parseElementAttributes(node.props, props)

  const slots: Record<string, TransientElement[]> = {}

  const children = node.children
    .map((child) => walk(child, props))
    .filter(Boolean) as TransientElement[]

  for (const child of children) {
    if (child.tag === 'template' && child.slots && child.attributes['v-slot']?.expression) {
      const slotName = child.attributes['v-slot'].expression
      assertIs(someString, slotName)
      slots[slotName] = child.slots.default || []
    } else {
      if (!slots.default) slots.default = []
      slots.default.push(child)
    }
  }

  return {
    id: crypto.randomUUID(),
    tag,
    isComponent,
    attributes,
    slots: Object.keys(slots).length ? slots : undefined,
  }
}

export function parseElementAttributes(
  props: (AttributeNode | DirectiveNode)[],
  componentProps: TransientProps,
): Record<string, BindingInfo> {
  const attributes: Record<string, BindingInfo> = {}

  for (const prop of props) {
    if (prop.type === NodeTypes.DIRECTIVE) {
      const attr = directiveToAttribute(prop, componentProps)
      if (attr) {
        const [key, value] = attr
        attributes[key] = value
      }
    } else if (prop.type === NodeTypes.ATTRIBUTE) {
      const key = prop.name
      if (prop.value?.content !== undefined) {
        attributes[key] = {
          type: 'literal',
          expression: prop.value.content,
        }
      } else {
        attributes[key] = {
          type: 'literal',
          expression: true,
        }
      }
    }
  }

  return attributes
}

function directiveToAttribute(
  { arg, name, exp }: DirectiveNode,
  componentProps: TransientProps,
): [string, BindingInfo] | null {
  if (arg && 'content' in arg) {
    if (name === 'slot') {
      const slotName = arg.content
      return ['v-slot', { type: 'literal', expression: slotName }]
    } else if (exp && 'content' in exp) {
      const value = extractBindingValue(exp.content, componentProps)
      if (name === 'bind') {
        return [arg.content, value]
      }
      const key = `${name}${arg ? `:${arg.content}` : ''}`
      return [key, value]
    }
  }
  // not supported
  return null
}

function extractBindingValue(content: string, props: TransientProps): BindingInfo {
  if (Object.hasOwn(props, content)) {
    return { type: 'prop', expression: content }
  }

  try {
    const expression = JSON5.parse(content)
    return { type: 'literal', expression }
  } catch {}

  return { type: 'expression', expression: content }
}
