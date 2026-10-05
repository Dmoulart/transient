import { createChecker, type ComponentMeta } from "vue-component-meta";
import { castDefaultValue, castPropType } from "./cast.js";
import { defineAnalyzer, type AnalyzerConfig } from "../analyzer.js";
import { dirname, resolve } from "path";
import type {
  TransientComponentSchema,
  TransientProps,
  TransientSlots,
} from "../../transient/definition.js";
import { logger } from "../../log/logger.js";
import { analyzeTemplateElements } from "./template.js";
import { fileURLToPath } from "url";

export type VueAnalyzerOptions = Pick<
  AnalyzerConfig,
  "tsConfigPath" | "dest" | "glob"
>;

const __dirname = dirname(fileURLToPath(import.meta.url));

export function defineVueAnalyzer(options: VueAnalyzerOptions) {
  const checker = createChecker(options.tsConfigPath, {
    forceUseTs: true,
    printer: { newLine: 1 },
  });

  return defineAnalyzer({
    dest: options.dest,
    tsConfigPath: options.tsConfigPath,
    glob: options.glob ?? "./**/*.vue",
    describe(path, dir) {
      const src = resolve(__dirname, dir, path);
      const meta = checker.getComponentMeta(src);
      return describeComponent(meta, src, path);
    },
  });
}

function describeComponent(
  meta: ComponentMeta,
  src: string,
  path: string,
): TransientComponentSchema {
  const tag =
    src
      .split("/")
      .pop()
      ?.replace(/\.vue$/, "") ?? "unknown";

  const props: TransientProps = {};
  let slots: TransientSlots | undefined = undefined;

  for (const prop of meta.props) {
    if (prop.global) continue;
    logger.details(`processing ${prop.name}`);

    const { name, description, required, default: defaultValue, schema } = prop;

    const { type, propInfos } = castPropType(schema);

    props[name] = {
      description: !!description ? description : undefined,
      default: defaultValue && castDefaultValue(defaultValue, type),
      required,
      ...propInfos,
      type,
    };
  }

  if (meta.slots.length > 0) {
    slots = {};
    for (const slot of meta.slots) {
      slots[slot.name] = {};
    }
  }

  const template = analyzeTemplateElements(src, props);

  return {
    tag,
    path,
    props,
    slots,
    template,
  };
}
