export function assert(value: boolean, message?: string): void {
  if (!value) {
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
  if (isOfType(value)) {
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

export const someString = (value: unknown): value is string =>
  typeof value === "string";

export const someRecord = (value: unknown): value is Record<string, any> =>
  typeof value === "object";
