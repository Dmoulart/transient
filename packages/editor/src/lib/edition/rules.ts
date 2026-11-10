import type { TransientComponentDictionnary, TransientElement } from '@transient/ir'
import { inject, provide } from 'vue'
import { matches } from '../query'
import type { Edition } from './edition'

export type Rule = { select?: string; can?: EditionTypes; cannot?: EditionTypes }

type EditionTypes = Edition['type'] | Edition['type'][]

export type Can = (type: Edition['type'], element: TransientElement) => boolean

// Allowed when no `can` rule targets the type (or one matches) and no `cannot` rule matches.
// A plain function: called from a template or a computed, Vue tracks what getElements() reads.
export function createCan(
  rules: Rule[],
  getElements: () => TransientElement[],
  dictionnary: TransientComponentDictionnary,
): Can {
  const normalized = rules.map((rule) => ({
    select: rule.select ?? '*',
    can: [rule.can ?? []].flat(),
    cannot: [rule.cannot ?? []].flat(),
  }))

  return (type, element) => {
    const hit = ({ select }: { select: string }) =>
      matches(select, element, getElements(), dictionnary)
    const cans = normalized.filter((rule) => rule.can.includes(type))
    const cannots = normalized.filter((rule) => rule.cannot.includes(type))

    return (cans.length === 0 || cans.some(hit)) && !cannots.some(hit)
  }
}

const canInjectionKey = Symbol('canInjectionKey')

export function provideCan(can: Can) {
  provide(canInjectionKey, can)
}

export function useCan(): Can {
  const can = inject<Can>(canInjectionKey)
  if (!can) {
    throw new Error('Expected can to be provided by ComponentEditor')
  }
  return can
}
