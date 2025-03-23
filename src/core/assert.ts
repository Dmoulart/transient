import type { PropertyMetaSchema } from "vue-component-meta";
import { type FixedArray } from "../helpers/types";
export function assert(value: unknown, message?: string): void {
  if (Boolean(value) === false) {
    throw new Error(message ?? "expected defined value");
  }
}

export function assertIsDefined<T>(
  value: T,
  message?: string
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(message ?? "expected defined value");
  }
}

export function assertIs<T>(
  isOfType: (value: unknown) => value is T,
  value: unknown,
  message?: string
): asserts value is T {
  if (!isOfType(value)) {
    throw new Error(message ?? `unuexpected type ${typeof value}`);
  }
}

export function assertIsArrayOf<T>(
  isOfType: (value: unknown) => value is T,
  value: unknown,
  message?: string
): asserts value is Array<T> {
  if (!Array.isArray(value)) {
    throw new Error(message ?? `expected array find type ${typeof value}`);
  }

  const invalid = value.find((item) => !isOfType(item));
  if (invalid) {
    throw new Error(message ?? `unexpected array element ${invalid}`);
  }
}

export function assertIsArrayOfLength<L extends number, T>(
  length: L,
  value: Array<T>,
  message?: string
): asserts value is FixedArray<T, L> {
  if (value.length !== length) {
    throw new Error(
      message ??
        `unexpected array length. Expected ${length} found ${value.length}`
    );
  }
}

export const someString = (value: unknown): value is string =>
  typeof value === "string";

export const someRecord = (value: unknown): value is Record<string, any> =>
  typeof value === "object";

export const somePropertyMetaSchemaObject = (
  value: unknown
): value is Exclude<PropertyMetaSchema, "string"> =>
  typeof value === "object" && value !== null && "kind" in value;

export const somePropertyMetaSchema = (
  value: unknown
): value is PropertyMetaSchema =>
  typeof value === "string" || somePropertyMetaSchemaObject(value);
