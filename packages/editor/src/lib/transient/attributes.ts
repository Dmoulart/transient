import type { TransientComponentSchema, TransientElement } from '@transient/ir'

export function parseElementAttributes(element: TransientElement) {
  return {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([key, value]) => [key, value.expression]),
    ),
  }
}

export function createComponentFromSchema(schema: TransientComponentSchema): TransientElement {
  return {
    tag: schema.tag,
    isComponent: true,
    attributes: {},
    id: crypto.randomUUID(),
  }
}
