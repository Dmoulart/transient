import {
  createChecker,
  type ComponentMeta,
  type PropertyMetaSchema,
} from "vue-component-meta";
import {
  normalizeListOfTypes,
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
    const { type, propInfos } = inspectPropertySchema(schema);

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

function inspectPropertySchema(schema: PropertyMetaSchema): TypeAnalysis {
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

      return normalizeListOfTypes(schema.schema);
    }
    case "object": {
      const objectDef = schema.schema;
      assertIsDefined(objectDef);
      assertIs(someRecord, objectDef);

      const object: TransientType<"object">["object"] = {};
      for (const [key, def] of Object.entries(objectDef)) {
        const { type, propInfos } = inspectPropertySchema(def.schema);

        object[key] = { type, ...propInfos };
      }

      return { type: { kind: "object", object } };
    }
    case "array": {
      const arrayDef = schema.schema;
      assertIsArrayOf(somePropertyMetaSchema, arrayDef);

      // @todo tuples
      let size: number = undefined;
      const isTuple = arrayDef.length > 1;
      if (arrayDef.length > 1) {
      }
      // assertIsArrayOfLength(1, arrayDef);

      const [arrayType] = arrayDef;

      if (typeof arrayType === "string") {
        const { type, propInfos } = inspectPropertySchema(arrayType);

        return {
          type: {
            kind: "list",
            list: {
              type,
              ...propInfos,
            },
          },
        };
      }

      if (arrayType.kind === "array") {
        throw new Error("Array of arrays not supported.");
      }

      const { type, propInfos } = inspectPropertySchema(arrayType);

      return {
        type: {
          kind: "list",
          list: {
            ...propInfos,
            type,
          },
        },
      };
    }
    // @temp
    case "event": {
      return {
        type: {
          kind: "record",
        },
      };
    }
  }
}
