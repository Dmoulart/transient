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

const dictionnary = new ComponentDictionnary(schemas as any)

export function useDictionnary() {
  return dictionnary
}

const componentModules = import.meta.glob('@/samples/**/*.vue')

export async function loadAllComponents(): Promise<Record<string, any>> {
  const result: Record<string, any> = {}

  for (const path in componentModules) {
    const name = path.split('/').pop()?.replace('.vue', '')
    if (name) {
      const mod: any = await componentModules[path]()
      result[name] = mod.default
      // schemasByName.value[name] = getTransientComponentSchemaByTag(name)
    }
  }

  return result
}

class MissingComponentError extends Error {}
