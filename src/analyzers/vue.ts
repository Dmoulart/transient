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
  TransientType,
} from "../transient/definition";
import {
  assertIsDefined,
  assertIsArrayOf,
  assertIs,
  someRecord,
  somePropertyMetaSchema,
} from "../helpers/assert";

export function defineVueAnalyzer(
  options: Pick<AnalyzerConfig, "tsConfigPath" | "dest">
) {
  const checker = createChecker(options.tsConfigPath, {
    forceUseTs: true,
    printer: { newLine: 1 },
  });

  return defineAnalyzer({
    dest: options.dest,
    tsConfigPath: options.tsConfigPath,
    glob: "./**/*.vue",
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

    const { name, description, required, default: defaultValue, schema } = prop;
    const { type, propInfos } = describePropType(schema);

    props[name] = {
      description: !!description ? description : undefined,
      default: defaultValue, // && unescapeString(defaultValue),
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
      type: toPrimitiveType(schema) ?? {
        kind: "record",
      },
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
