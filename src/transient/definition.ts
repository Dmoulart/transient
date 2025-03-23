export type TransientComponentSchema = {
  props: TransientProps;
};

export type TransientProps = Record<string, TransientProp>;

export type TransientProp = {
  type: TransientType;
  description?: string;
  required?: boolean;
  default?: string | undefined;
};

export type TransientType<T extends TransientTypeName = TransientTypeName> =
  T extends TransientPrimitiveTypeName
    ? T | { kind: T }
    : T extends "enum"
    ? { kind: "enum"; enum: string[] }
    : T extends "object"
    ? { kind: "object"; object: Record<string, TransientProp> }
    : T extends "list"
    ? { kind: "list"; list: TransientProp }
    : T extends "record"
    ? { kind: "record" }
    : T extends "union"
    ? { kind: "union"; union: TransientType[] }
    : { kind: T };

export type TransientTypeName =
  | TransientPrimitiveTypeName
  | TransientComplexTypeName;

export type TransientComplexTypeName =
  | "list"
  | "object"
  | "union"
  | "enum"
  | "record";

export type TransientPrimitiveTypeName =
  | "boolean"
  | "integer"
  | "decimal"
  | "unknown"
  | "string";

const test: TransientComponentSchema = {
  props: {
    ok: {
      type: "boolean",
      default: "false",
      description: "",
      required: true,
    },
    err: {
      type: {
        kind: "enum",
        enum: ["1", "2", "3"],
      },
    },
    bigObject: {
      type: {
        kind: "object",
        object: {
          prop: {
            type: "string",
          },
        },
      },
    },
    arr: {
      type: {
        kind: "list",
        list: {
          type: "string",
        },
      },
    },
  },
};
