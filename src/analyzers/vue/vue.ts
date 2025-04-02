import { createChecker, type ComponentMeta } from "vue-component-meta";
import { castPropType } from "./cast";
import { defineAnalyzer, type AnalyzerConfig } from "../analyzer";
import { resolve } from "path";
import type {
  TransientComponentSchema,
  TransientProps,
  TransientSlots,
} from "../../transient/definition";
import { logger } from "../../log/logger";
import { unescapeString } from "../../core/string";

export function defineVueAnalyzer(
  options: Pick<AnalyzerConfig, "tsConfigPath" | "dest" | "glob">
) {
  const checker = createChecker(options.tsConfigPath, {
    forceUseTs: true,
    printer: { newLine: 1 },
  });

  return defineAnalyzer({
    dest: options.dest,
    tsConfigPath: options.tsConfigPath,
    glob: options.glob ?? "./**/*.vue",
    describe(path, dir) {
      const meta = checker.getComponentMeta(resolve(__dirname, dir, path));
      return describeComponent(meta);
    },
  });
}

function describeComponent(meta: ComponentMeta): TransientComponentSchema {
  const props: TransientProps = {};
  const slots: TransientSlots = {};

  for (const prop of meta.props) {
    if (prop.global) continue;
    logger.details(`processing ${prop.name}`);

    const { name, description, required, default: defaultValue, schema } = prop;
    const { type, propInfos } = castPropType(schema);

    props[name] = {
      description: !!description ? description : undefined,
      default: defaultValue && unescapeString(defaultValue),
      required,
      ...propInfos,
      type,
    };
  }

  for (const slot of meta.slots) {
    slots[slot.name] = {};
  }

  return {
    props,
    slots,
  };
}
