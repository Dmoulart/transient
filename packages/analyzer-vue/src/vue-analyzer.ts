import { resolve } from 'node:path'
import type { TransientComponentSchema, TransientProps, TransientSlots } from '@transient/ir'
import { type ComponentMeta, createChecker } from 'vue-component-meta'
import { type AnalyzerConfig, defineAnalyzer } from './analyzer.js'
import { castDefaultValue, castPropType } from './cast.js'
import { logger } from './log/logger.js'
import { analyzeTemplateElements } from './template.js'

export type VueAnalyzerOptions = Pick<AnalyzerConfig, 'tsConfigPath' | 'dest' | 'glob'>

export function defineVueAnalyzer(options: VueAnalyzerOptions) {
  const checker = createChecker(options.tsConfigPath, {
    forceUseTs: true,
    printer: { newLine: 1 },
  })

  return defineAnalyzer({
    dest: options.dest,
    tsConfigPath: options.tsConfigPath,
    glob: options.glob ?? './**/*.vue',
    describe(path, dir) {
      const src = resolve(process.cwd(), dir, path)
      const meta = checker.getComponentMeta(src)
      return describeComponent(meta, src, path)
    },
  })
}

function describeComponent(
  meta: ComponentMeta,
  src: string,
  path: string,
): TransientComponentSchema {
  const tag =
    src
      .split('/')
      .pop()
      ?.replace(/\.vue$/, '') ?? 'unknown'

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
