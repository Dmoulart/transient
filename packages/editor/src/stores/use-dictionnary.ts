import type { TransientComponentDictionnary } from 'transient/src/transient'
import { shallowRef } from 'vue'
import schemas from '@/assets/schemas/__schemas__.json'

export const dictionnary = shallowRef<TransientComponentDictionnary>(schemas as any)

export async function loadDictionnary() {
  try {
    const response = await fetch('http://127.0.0.1:3001/schemas')
    await response.json()
  } catch (error) {
    console.error(error)
  }
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

export function useDictionnary() {
  return dictionnary
}

export const registry: TransientComponentDictionnary =
  schemas as unknown as TransientComponentDictionnary
