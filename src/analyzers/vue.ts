import {
  createChecker,
  type ComponentMeta,
  type PropertyMetaSchema,
} from "vue-component-meta";
import {
  castArray,
  castEnumType,
  castEvent,
  castObject,
  toPrimitiveType,
  type TypeAnalysis,
} from "./cast";
import { defineAnalyzer, type AnalyzerConfig } from "../analyzer";
import { resolve } from "path";
import type {
  TransientComponent,
  TransientProps,
} from "../transient/definition";
import { assertIsDefined } from "../helpers/assert";
import { logger } from "../log/logger";
import { unescapeString } from "../core/string";

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

function describeComponent(meta: ComponentMeta): TransientComponent {
  const props: TransientProps = {};

  for (const prop of meta.props) {
    if (prop.global) continue;
    logger.details(`processing ${prop.name}`);

    const { name, description, required, default: defaultValue, schema } = prop;
    const { type, propInfos } = describePropType(schema);

    props[name] = {
      description: !!description ? description : undefined,
      default: defaultValue && unescapeString(defaultValue),
      required,
      ...propInfos,
      type,
    };
  }

  return {
    props,
  };
}

export function describePropType(schema: PropertyMetaSchema): TypeAnalysis {
  if (typeof schema === "string") {
    return {
      type: toPrimitiveType(schema) ?? "unknown",
    };
  }

  switch (schema.kind) {
    case "enum": {
      assertIsDefined(schema.schema);

      return castEnumType(schema.schema);
    }
    case "object": {
      return castObject(schema);
    }
    case "array": {
      return castArray(schema);
    }
    case "event": {
      return castEvent(schema);
    }
  }
}
