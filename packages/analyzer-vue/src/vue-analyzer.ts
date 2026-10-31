import { dirname } from 'node:path'
import type {
  TransientComponentDictionnary,
  TransientComponentSchema,
  TransientProps,
  TransientSlots,
} from '@transient/ir'
import { type ComponentMeta, createCheckerByJson } from 'vue-component-meta'
import { castDefaultValue, castPropType } from './cast.js'
import { logger } from './log/logger.js'
import { analyzeTemplateElements } from './template.js'

export type ComponentEntry = {
  name: string
  filePath: string
  exportName?: string
}

// Components that can't be described (no types, not a component…) are left out:
// the editor still renders them, it just can't edit their props.
export function describeVueComponents(
  entries: ComponentEntry[],
  tsConfigPath: string,
): TransientComponentDictionnary {
  // the entries join the project's program: components from node_modules
  // (NuxtImg, NuxtLink…) aren't part of it otherwise
  const checker = createCheckerByJson(
    dirname(tsConfigPath),
    { extends: tsConfigPath, files: entries.map((entry) => entry.filePath) },
    { forceUseTs: true, printer: { newLine: 1 } },
  )
  const dictionnary: TransientComponentDictionnary = {}

  for (const { name, filePath, exportName } of entries) {
    try {
      const meta = checker.getComponentMeta(filePath, exportName)
      dictionnary[name] = describeComponent(meta, filePath, filePath, name)
    } catch (e) {
      logger.details(`skipped ${name}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return dictionnary
}

function describeComponent(
  meta: ComponentMeta,
  src: string,
  path: string,
  tag: string,
): TransientComponentSchema {
  const props: TransientProps = {}
  let slots: TransientSlots | undefined

  for (const prop of meta.props) {
    if (prop.global) continue
    logger.details(`processing ${prop.name}`)

    const { name, description, required, default: defaultValue, schema } = prop

    const { type, propInfos } = castPropType(schema)

    props[name] = {
      description: description ? description : undefined,
      default: defaultValue && castDefaultValue(defaultValue, type),
      required,
      ...propInfos,
      type,
    }
  }

  if (meta.slots.length > 0) {
    slots = {}
    for (const slot of meta.slots) {
      slots[slot.name] = {}
    }
  }

  const template = analyzeTemplateElements(src, props)

  return {
    tag,
    path,
    props,
    slots,
    template,
  }
}
