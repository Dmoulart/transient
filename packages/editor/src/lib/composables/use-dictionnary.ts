import type { TransientComponentDictionnary, TransientComponentSchema } from 'transient'
import schemas from '@/assets/schemas/__schemas__.json'

export class ComponentDictionnary {
  constructor(private schemas: TransientComponentDictionnary) {}

  get(tag: string): TransientComponentSchema {
    return this.schemas[tag]
  }

  all(): TransientComponentDictionnary {
    return this.schemas
  }
}

const dictionnary = new ComponentDictionnary(schemas as TransientComponentDictionnary)

export function useDictionnary() {
  return dictionnary
}

const componentModules = import.meta.glob(['@/samples/**/*.vue', '@/tests/**/*.vue'])

export async function loadAllComponents(): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}

  for (const path in componentModules) {
    const name = path.split('/').pop()?.replace('.vue', '')
    if (name) {
      const mod = await componentModules[path]()
      // @ts-expect-error : check if it is possible to type
      result[name] = mod.default
      // schemasByName.value[name] = getTransientComponentSchemaByTag(name)
    }
  }

  return result
}

class MissingComponentError extends Error {}
