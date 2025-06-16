import type {
  TransientComponentDictionnary,
  TransientComponentSchema,
} from 'transient/src/transient'
import { shallowRef } from 'vue'
import schemas from '@/assets/schemas/__schemas__.json'

export const registry = shallowRef<TransientComponentDictionnary>(schemas as any)

export function useRegistry() {
  return registry
}

export function getTransientComponentSchema(name: string): TransientComponentSchema {
  if (!registry.value[name]) {
    throw new Error(`Unknown schema ${name}`)
  }

  return { ...registry.value[name] }
}

// Crée un résolveur global de composants
const componentModules = import.meta.glob('@/samples/**/*.vue')

export async function loadAllComponents(): Promise<Record<string, any>> {
  const result: Record<string, any> = {}

  for (const path in componentModules) {
    const name = path.split('/').pop()?.replace('.vue', '')
    if (name) {
      const mod: any = await componentModules[path]()
      result[name] = mod.default
    }
  }

  return result
}
