import type {
  TransientComponentDictionnary,
  TransientComponentSchema,
} from 'transient/src/transient'
import { ref, shallowRef } from 'vue'
import schemas from '@/assets/schemas/__schemas__.json'

class ComponentDictionnary {
  constructor(private schemas: TransientComponentDictionnary) {}

  get(tag: string): TransientComponentSchema {
    const component = this.schemas[tag]
    if (!component) {
      throw new MissingComponentError(`Unknown component ${tag}`)
    }

    return component
  }

  all() {
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
