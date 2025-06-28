export type TransientComponentDictionnary = {
  [tag: string]: TransientComponentSchema;
};

export type TransientElement = {
  id: string;
  tag: string; // peut être div, my-button, par ex
  isComponent: boolean; // indique si c'est un composant custom
  attributes: Record<string, BindingInfo>;
  slots?: Record<string, TransientElement[]>;
};

export type TransientTemplate = {
  elements: TransientElement[];
};

export type TransientComponentSchema = {
  tag: string;
  path: string;
  props: TransientProps;
  slots?: TransientSlots;
  template?: TransientTemplate;
};

export type TransientSlots = Record<string, TransientSlot>;

export type TransientProps = Record<string, TransientProp>;

export type TransientProp = {
  type: TransientType;
  description?: string;
  required?: boolean;
  default?: string | boolean | undefined;
};

export type TransientSlot = any;

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

export type BindingInfo = {
  type: "prop" | "literal";
  expression: string | number | boolean;
};

// const test: TransientComponentSchema = {
//   props: {
//     ok: {
//       type: "boolean",
//       default: "false",
//       description: "",
//       required: true,
//     },
//     err: {
//       type: {
//         kind: "enum",
//         enum: ["1", "2", "3"],
//       },
//     },
//     bigObject: {
//       type: {
//         kind: "object",
//         object: {
//           prop: {
//             type: "string",
//           },
//         },
//       },
//     },
//     arr: {
//       type: {
//         kind: "list",
//         list: {
//           type: "string",
//         },
//       },
//     },
//   },
// };
