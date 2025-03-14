export type TransientComponent = {
  props: TransientProp[];
};

export type TransientProp = {
  name: string;
  type: TransientType;
  description?: string;
  required?: boolean;
  default?: string | undefined;
};

export type TransientType<T extends TransientTypeName = TransientTypeName> =
  T extends TransientPrimitiveTypeName
    ? T | { kind: T }
    : T extends "enum"
    ? { kind: "enum"; values: string[] }
    : { kind: T }; // All other kinds only have `kind`

export type TransientTypeName =
  | TransientPrimitiveTypeName
  | TransientComplexTypeName;

export type TransientComplexTypeName = "list" | "object" | "union" | "enum";

export type TransientPrimitiveTypeName =
  | "boolean"
  | "integer"
  | "decimal"
  | "string";
