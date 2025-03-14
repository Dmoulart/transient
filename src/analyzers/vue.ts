import {
  ComponentMeta,
  createChecker,
  PropertyMetaSchema,
} from "vue-component-meta";
import { AnalyzerConfig, defineAnalyzer } from "../analyzer";
import { resolve } from "path";
import {
  TransientComponent,
  TransientProp,
  TransientType,
} from "../transient/definition";
import {
  assertIsDefined,
  assertIsArrayOf,
  someString,
} from "../helpers/assert";
import { unescapeString } from "../helpers/string";

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
    describe(path, dir) {
      const meta = checker.getComponentMeta(resolve(__dirname, dir, path));
      return describeComponent(meta);
    },
  });
}

function describeComponent(meta: ComponentMeta): TransientComponent {
  const props: TransientProp[] = [];

  for (const prop of meta.props) {
    if (prop.global) continue;

    const { name, description, required, default: defaultValue, schema } = prop;
    const { type, propInfos } = inspectPropertySchema(schema);

    props.push({
      name,
      description: !!description ? description : undefined,
      default: defaultValue && unescapeString(defaultValue),
      required,
      ...propInfos,
      type,
    });
  }

  return {
    props,
  };
}

type PropertySchemaInspection = {
  type: TransientType;
  propInfos?: Partial<TransientProp>;
};
function inspectPropertySchema(
  schema: PropertyMetaSchema
): PropertySchemaInspection {
  if (typeof schema === "string") {
    switch (schema) {
      case "string":
        return { type: "string" };
      case "boolean":
        return { type: "boolean" };
      case "number":
        return { type: "decimal" };
      default:
        throw new Error(`unsupported type ${schema}`);
    }
  }

  switch (schema.kind) {
    case "enum": {
      const enumeration = schema.schema;

      assertIsDefined(enumeration);

      const maybeBooleanType = getBooleanTypeIfAny(enumeration);

      if (maybeBooleanType) {
        return maybeBooleanType;
      }

      assertIsArrayOf(someString, enumeration);

      return {
        type: {
          kind: "enum",
          enum: enumeration.map(unescapeString),
        },
      };
    }
    case "object":
    case "array":
    case "event":
      throw new Error(`unsupported type ${schema.kind}`);
  }
}

function getBooleanTypeIfAny(
  enumeration: PropertyMetaSchema[]
): PropertySchemaInspection | false {
  assertIsDefined(enumeration);
  assertIsArrayOf(someString, enumeration);

  if (enumeration.length == 2) {
    const [maybeFalse, maybeTrue] = enumeration;
    const isRequiredBoolean = maybeFalse === "false" && maybeTrue === "true";

    if (isRequiredBoolean) {
      return {
        type: "boolean",
        propInfos: {
          required: true,
        },
      };
    } else {
      return false;
    }
  }

  if (enumeration.length == 3) {
    const [maybeUndefined, maybeFalse, maybeTrue] = enumeration;
    const isOptionalBoolean =
      maybeUndefined === "undefined" &&
      maybeFalse === "false" &&
      maybeTrue === "true";

    if (isOptionalBoolean) {
      return {
        type: "boolean",
        propInfos: {
          required: false,
        },
      };
    } else {
      return false;
    }
  }

  return false;
}
