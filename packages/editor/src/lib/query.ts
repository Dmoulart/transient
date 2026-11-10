import {
  getTextValue,
  type TransientComponentDictionnary,
  type TransientElement,
} from '@transient/ir'
import { is, type Options, selectAll } from 'css-select'
import globToRegExp from 'glob-to-regexp'

type QueryAdapter = NonNullable<Options<TransientElement, TransientElement>['adapter']>

type TreeIndex = Map<
  TransientElement,
  { parent: TransientElement | null; siblings: TransientElement[] }
>

function indexTree(
  elements: TransientElement[],
  parent: TransientElement | null = null,
  index: TreeIndex = new Map(),
): TreeIndex {
  for (const el of elements) {
    index.set(el, { parent, siblings: elements })
    for (const slot of Object.values(el.slots ?? {})) indexTree(slot, el, index)
  }
  return index
}

export function query(
  selector: string,
  elements: TransientElement[],
  dictionnary: TransientComponentDictionnary,
) {
  return selectAll(selector, elements, createOptions(elements, dictionnary))
}

export function matches(
  selector: string,
  element: TransientElement,
  elements: TransientElement[],
  dictionnary: TransientComponentDictionnary,
) {
  return is(element, selector, createOptions(elements, dictionnary))
}

// todo: perf ? cache
function createOptions(
  elements: TransientElement[],
  dictionnary: TransientComponentDictionnary,
): Options<TransientElement, TransientElement> {
  return {
    adapter: createRuleAdapter(dictionnary, indexTree(elements)),
    pseudos: createPseudos(dictionnary),
    // keep tag names case sensitive (Hero ≠ hero)
    xmlMode: true,
  }
}

// pseudo-classes: what attribute operators can't express
function createPseudos(dictionnary: TransientComponentDictionnary) {
  return {
    // :path("components/blocks/**")
    path: (el: TransientElement, arg?: string | null) => {
      const path = dictionnary[el.tag]?.path
      // css-what keeps the quotes around pseudo arguments
      const glob = arg?.replace(/^(["'])(.*)\1$/, '$2')
      // globstar: * stops at /, ** crosses folders. extended: ?, [abc], {a,b}
      return !!path && !!glob && globToRegExp(glob, { globstar: true, extended: true }).test(path)
    },
  }
}

function createRuleAdapter(
  dictionnary: TransientComponentDictionnary,
  index: TreeIndex,
): QueryAdapter {
  return {
    isTag: (el): el is TransientElement => el.tag !== '#text',
    getAttributeValue: (el, name) => {
      return matchTransientAttribute(dictionnary, el, name)
    },
    getChildren: (el) => Object.values(el.slots ?? {}).flat(),
    getName: (el) => el.tag,
    getParent: (el) => index.get(el)?.parent ?? null,
    // siblings = the element's own slot, not every child of the parent
    getSiblings: (el) => index.get(el)?.siblings ?? [el],
    getText: (el) => (el.tag === '#text' ? String(getTextValue(el) ?? '') : ''),
    hasAttrib: (el, name) => {
      return Boolean(matchTransientAttribute(dictionnary, el, name))
    },
    removeSubsets: (nodes) => nodes, // Optionnel selon la gestion des doublons
  }
}

function matchTransientAttribute(
  dictionnary: TransientComponentDictionnary,
  el: TransientElement,
  name: string,
) {
  if (['id', 'tag', 'isComponent'].includes(name)) {
    return String(el[name as 'id' | 'tag' | 'isComponent'])
  }

  if (name in el.attributes) {
    const attribute = el.attributes[name]
    if (attribute?.type === 'literal') {
      return attribute.expression ? String(attribute.expression) : undefined
    }
  }

  if (name === 'path') {
    // plain elements have no schema
    return dictionnary[el.tag]?.path
  }
}
