import type {
  TransientComponentDictionnary,
  TransientComponentSchema,
} from 'transient/src/transient'
import { ref, shallowRef } from 'vue'
import schemas from '@/assets/schemas/__schemas__.json'

export const registry = shallowRef<TransientComponentDictionnary>(schemas as any)

export function useRegistry() {
  return registry
}

export function getTransientComponentSchemaByPath(path: string): TransientComponentSchema {
  if (!registry.value[path]) {
    throw new Error(`Unknown schema ${path}`)
  }

  return { ...registry.value[path] }
}

export function getTransientComponentSchemaByTag(tag: string): TransientComponentSchema {
  if (!schemasByName.value[tag]) {
    throw new Error(`Unknown schema ${tag}`)
  }

  return { ...schemasByName.value[tag] }
}

const componentModules = import.meta.glob('@/samples/**/*.vue')

const schemasByName = ref({} as Record<string, TransientComponentSchema>)

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

class ComponentDictionnary {
  constructor(private schemas: TransientComponentDictionnary) {}

  getByPath(path: string) {
    if (this.schemas[path]) {
      throw new MissingComponentError(`Unknown schema ${path}`)
    }

    return registry.value[path]
  }
}

class MissingComponentError extends Error {}
