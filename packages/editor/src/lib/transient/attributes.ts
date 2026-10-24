import type { TransientElement } from '@transient/ir'

export function parseElementAttributes(element: TransientElement) {
  return {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([key, value]) => [key, value.expression]),
    ),
  };
}
