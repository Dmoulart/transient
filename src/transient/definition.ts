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
    ? { kind: "enum"; enum: string[] }
    : { kind: T };

export type TransientTypeName =
  | TransientPrimitiveTypeName
  | TransientComplexTypeName;

export type TransientComplexTypeName = "list" | "object" | "union" | "enum";

export type TransientPrimitiveTypeName =
  | "boolean"
  | "integer"
  | "decimal"
  | "string";

// const test: TransientComponent = {
//   props: [
//     {
//       name: "OK",
//       type: "boolean",
//     },
//     {
//       name: "",
//       type: {
//         kind: "enum",
//         enum: ["1", "2", "3"],
//       },
//     },
//   ],
// };
