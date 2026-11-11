import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import { camelCase, mapKeys, pascalCase } from '@transient/core'
import type {
  BindingInfo,
  TransientElement,
  TransientElementAttributes,
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
  return analyzeTemplateSource(readFileSync(componentPath, 'utf-8'), props)
}

export function analyzeTemplateSource(source: string, props: TransientProps): TransientTemplate {
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

  const parsed = parseElementAttributes(node.props, props)
  // a component's attributes are keyed like its props (bg-image → bgImage), as Vue does.
  // Native ones stay as written: viewBox would come back as view-box
  const attributes = isComponent ? mapKeys(parsed, camelCase) : parsed

  const slots: Record<string, TransientElement[]> = {}

  for (const child of node.children) {
    const slotName = slotNameOf(child)
    const content = slotName ? (child as ElementNode).children : [child]
    const elements = content.map((node) => walk(node, props)).filter(Boolean) as TransientElement[]
    slots[slotName ?? 'default'] = [...(slots[slotName ?? 'default'] ?? []), ...elements]
  }

  return {
    id: crypto.randomUUID(),
    tag,
    isComponent,
    attributes,
    slots: Object.keys(slots).length ? slots : undefined,
  }
}

function slotNameOf(node: TemplateChildNode): string | null {
  if (node.type !== NodeTypes.ELEMENT || node.tag !== 'template') {
    return null
  }

  const slot = node.props.find((prop) => prop.type === NodeTypes.DIRECTIVE && prop.name === 'slot')
  if (!slot) {
    return null
  }

  return slot.type === NodeTypes.DIRECTIVE && slot.arg && 'content' in slot.arg
    ? slot.arg.content
    : 'default'
}

export function parseElementAttributes(
  props: (AttributeNode | DirectiveNode)[],
  componentProps: TransientProps,
): TransientElementAttributes {
  const attributes: TransientElementAttributes = {}

  for (const prop of props) {
    if (prop.type === NodeTypes.DIRECTIVE) {
      const [key, value] = directiveToAttribute(prop, componentProps)
      attributes[key] = value
    } else if (prop.type === NodeTypes.ATTRIBUTE) {
      const key = prop.name
      // an attribute without value (`<X highlight>`) is '' like for Vue: a boolean prop reads it as true
      attributes[key] = { type: 'literal', expression: prop.value?.content ?? '' }
    }
  }

  return attributes
}

function directiveToAttribute(
  node: DirectiveNode,
  componentProps: TransientProps,
): [string, BindingInfo | null] {
  const name = node.name
  let value: BindingInfo | null = null
  let arg: string | null = null

  if (node.exp && 'content' in node.exp) {
    value = extractBindingValue(node.exp.content, componentProps)
  }

  if (node.arg && 'content' in node.arg) {
    arg = node.arg.content
  }

  const key = `${name}${arg ? `:${arg}` : ''}`

  return [formatAttributeKey(key), value]
}

function formatAttributeKey(name: string) {
  if (name.startsWith('bind:')) {
    return name.slice('bind:'.length)
  }

  return name
}

function extractBindingValue(content: string, props: TransientProps): BindingInfo {
  if (Object.hasOwn(props, content)) {
    return { type: 'expression', expression: content }
  }

  try {
    const expression = JSON5.parse(content)
    return { type: 'literal', expression }
  } catch {}

  return { type: 'expression', expression: content }
}
