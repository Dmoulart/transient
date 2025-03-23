import { type PropertyMetaSchema } from "vue-component-meta";
import {
  assert,
  assertIs,
  assertIsArrayOf,
  assertIsDefined,
  somePropertyMetaSchema,
  somePropertyMetaSchemaObject,
  someRecord,
  someString,
} from "../../core/assert";
import type { TransientProp, TransientType } from "../../transient/definition";
import { isEscapedString, isNumeric, unescapeString } from "../../core/string";
import { describePropType } from "./vue";
import { logger } from "../../log/logger";

export type TypeAnalysis = {
  type: TransientType;
  propInfos?: Partial<TransientProp>;
};

export type TypeNormalizationAnalysis = [
  PropertyMetaSchema[],
  Partial<TypeAnalysis> | undefined
];
const isStringLiteral = isEscapedString;

export function castEnumType(enumeration: PropertyMetaSchema[]): TypeAnalysis {
  let normalizedEnum = [...enumeration];

  const types: TransientType[] = [];
  let required = false;

  for (const collect of [
    collectOptionalsFromEnum,
    collectStringLiteralsFromEnum,
    collectBooleanFromEnum,
    collectNumbersFromEnum,
    collectObjectTypesFromEnum,
    collectArrayTypesFromEnum,
    collectEventTypesFromEnum,
    collectPrimitiveTypesFromEnum,
  ]) {
    const [filteredEnum, result] = collect(normalizedEnum);

    normalizedEnum = filteredEnum;

    if (result?.type) {
      types.push(result.type);
    }

    if (result?.propInfos?.required) {
      required = true;
    }
  }

  if (types.length === 1) {
    return {
      type: types[0],
      propInfos: {
        required,
      },
    };
  }

  return {
    type: mergeTypes(types),
    propInfos: {
      required,
    },
  };
}

export function collectStringLiteralsFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  const stringLiterals: string[] = [];

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someString(type) && isStringLiteral(type)) {
      const [value] = enumeration.splice(i, 1);
      stringLiterals.push(unescapeString(value as string));
    }
  }

  if (stringLiterals.length === 0) {
    return [enumeration, undefined];
  }

  return [
    enumeration,
    {
      type: {
        kind: "enum",
        // get back the enum in order
        enum: stringLiterals.reverse(),
      },
    },
  ];
}

export function collectBooleanFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  let booleans: number = 0; // 0b0 is none, 0b1 is true , 0b10 is  false, 0b11 is both

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someString(type)) {
      if (type === "true") {
        booleans |= 0b01;
        enumeration.splice(i, 1);
      } else if (type === "false") {
        booleans |= 0b10;
        enumeration.splice(i, 1);
      }
    }
  }

  if (booleans !== 0b11) {
    return [enumeration, undefined];
  }

  return [
    enumeration,
    {
      type: "boolean",
    },
  ];
}

export function collectOptionalsFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  let required = true;

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someString(type)) {
      if (type === "undefined" || type === "null") {
        enumeration.splice(i, 1);
        required = false;
      }
    }
  }

  return [
    enumeration,
    {
      propInfos: {
        required,
      },
    },
  ];
}

export function collectNumbersFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  const numbers: string[] = [];
  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someString(type) && isNumeric(type)) {
      numbers.push(...(enumeration.splice(i, 1) as string[]));
    }
  }

  if (numbers.length === 0) {
    return [enumeration, undefined];
  }

  return [
    enumeration,
    {
      type: {
        kind: "enum",
        enum: numbers.reverse(),
      },
    },
  ];
}

export function collectArrayTypesFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  const complexTypes: TransientType[] = [];

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someRecord(type) && type.kind === "array") {
      complexTypes.push(castArray(enumeration.splice(i, 1)[0]).type);
    }
  }

  if (complexTypes.length === 0) {
    return [enumeration, undefined];
  }

  if (complexTypes.length === 1) {
    return [
      enumeration,
      {
        type: complexTypes[0],
      },
    ];
  }

  return [
    enumeration,
    {
      type: {
        kind: "union",
        union: complexTypes.reverse(),
      },
    },
  ];
}

export function collectObjectTypesFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  const complexTypes: TransientType[] = [];

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someRecord(type) && type.kind === "object") {
      complexTypes.push(castObject(enumeration.splice(i, 1)[0]).type);
    }
  }

  if (complexTypes.length === 0) {
    return [enumeration, undefined];
  }

  if (complexTypes.length === 1) {
    return [
      enumeration,
      {
        type: complexTypes[0],
      },
    ];
  }

  return [
    enumeration,
    {
      type: {
        kind: "union",
        union: complexTypes.reverse(),
      },
    },
  ];
}

export function collectEventTypesFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  const eventTypes: TransientType[] = [];

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someRecord(type) && type.kind === "event") {
      eventTypes.push(castEvent(enumeration.splice(i, 1)[0]).type);
    }
  }

  if (eventTypes.length === 0) {
    return [enumeration, undefined];
  }

  if (eventTypes.length === 1) {
    return [
      enumeration,
      {
        type: eventTypes[0],
      },
    ];
  }

  return [
    enumeration,
    {
      type: {
        kind: "union",
        union: eventTypes.reverse(),
      },
    },
  ];
}

export function collectPrimitiveTypesFromEnum(
  enumeration: PropertyMetaSchema[]
): TypeNormalizationAnalysis {
  const primitiveTypes: TransientType[] = [];

  for (let i = enumeration.length - 1; i >= 0; i--) {
    const type = enumeration[i];

    if (someString(type)) {
      const maybePrimitiveType = toPrimitiveType(type);

      if (maybePrimitiveType) {
        enumeration.splice(i, 1);
        primitiveTypes.push(maybePrimitiveType);
      }
    }
  }

  if (primitiveTypes.length === 0) {
    return [enumeration, undefined];
  }

  if (primitiveTypes.length === 1) {
    return [
      enumeration,
      {
        type: primitiveTypes[0],
      },
    ];
  }

  return [
    enumeration,
    {
      type: {
        kind: "union",
        union: primitiveTypes.reverse(),
      },
    },
  ];
}

export function mergeTypes(types: TransientType[]): TransientType {
  const flattenedTypes: TransientType[] = [];

  for (const type of types) {
    if (typeof type !== "string" && "kind" in type && type.kind === "union") {
      // If it's already a union, flatten its members
      flattenedTypes.push(...type.union);
    } else {
      flattenedTypes.push(type);
    }
  }

  if (flattenedTypes.length === 1) {
    return flattenedTypes[0];
  }

  return {
    kind: "union",
    union: flattenedTypes,
  };
}

export function toPrimitiveType(
  schema: PropertyMetaSchema
): TransientType | undefined {
  assertIs(someString, schema);

  switch (schema) {
    case "any":
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "number":
      return "decimal";
    default: {
      // @tmp
      if (schema.startsWith("Record")) {
        // @tmp
        return {
          kind: "record",
        };
      }

      return "unknown";

      //   return undefined;
    }
  }
}

export function castObject(schema: PropertyMetaSchema): TypeAnalysis {
  assertIs(someRecord, schema);
  assert(schema.kind === "object");
  const objectDef = schema.schema;
  assertIsDefined(objectDef);

  const object: TransientType<"object">["object"] = {};

  const hasTooManyProps = Object.keys(objectDef).length > 20;

  if (hasTooManyProps) {
    logger.info("skipping object type, too many props...");
    return { type: "unknown" };
  }

  for (const [key, def] of Object.entries(objectDef)) {
    const { type, propInfos } = describePropType(def.schema);
    object[key] = { type, ...propInfos };
  }

  const hasUnknownProps = Object.values(object).every(
    (prop) => prop.type === "unknown"
  );

  if (hasUnknownProps) {
    logger.info("skipping object type, unknown props...");
    return { type: "unknown" };
  }

  return { type: { kind: "object", object } };
}

export function castArray(schema: PropertyMetaSchema): TypeAnalysis {
  assertIs(someRecord, schema);
  assert(schema.kind === "array");

  const arrayDef = schema.schema;
  assertIsArrayOf(somePropertyMetaSchema, arrayDef);

  // @todo tuples
  // let size: number = undefined;
  // const isTuple = arrayDef.length > 1;
  // if (arrayDef.length > 1) {
  // }
  if (arrayDef.length === 0) {
    return {
      type: "unknown",
    };
  }

  const [arrayType] = arrayDef;

  if (typeof arrayType === "string") {
    const { type, propInfos } = describePropType(arrayType);

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

  if (!arrayType || arrayType.kind === "array") {
    console.error("damned");
    throw new Error("Array of arrays not supported.");
  }

  const { type, propInfos } = describePropType(arrayType);

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

export function castEvent(schema: PropertyMetaSchema): TypeAnalysis {
  return {
    type: "unknown",
  };
}
