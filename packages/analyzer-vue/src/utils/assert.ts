import type { PropertyMetaSchema } from "vue-component-meta";

export const somePropertyMetaSchemaObject = (
  value: unknown,
): value is Exclude<PropertyMetaSchema, string> =>
  typeof value === "object" && value !== null && "kind" in value;

export const somePropertyMetaSchema = (
  value: unknown,
): value is PropertyMetaSchema =>
  typeof value === "string" || somePropertyMetaSchemaObject(value);
