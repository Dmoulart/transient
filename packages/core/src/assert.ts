export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new AssertionError(message ?? 'expected truthy value')
  }
}

export function assertDefined<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new AssertionError(message ?? 'expected defined value')
  }
}

export function assertIs<T>(
  isOfType: (value: unknown) => value is T,
  value: unknown,
  message?: string,
): asserts value is T {
  if (!isOfType(value)) {
    throw new AssertionError(message ?? `unexpected type ${typeof value}`)
  }
}

export function assertIsArrayOf<T>(
  isOfType: (value: unknown) => value is T,
  value: unknown,
  message?: string,
): asserts value is Array<T> {
  if (!Array.isArray(value)) {
    throw new Error(message ?? `expected array, found ${typeof value}`)
  }

  const index = value.findIndex((item) => !isOfType(item))
  if (index !== -1) {
    throw new AssertionError(message ?? `unexpected array element at ${index}: ${value[index]}`)
  }
}

export type FixedArray<T, L extends number> = Array<T> & { length: L }
export function assertIsArrayOfLength<L extends number, T>(
  length: L,
  value: Array<T>,
  message?: string,
): asserts value is FixedArray<T, L> {
  if (value.length !== length) {
    throw new AssertionError(
      message ?? `unexpected array length. Expected ${length} found ${value.length}`,
    )
  }
}

export const someString = (value: unknown): value is string => typeof value === 'string'

export const someRecord = <T = unknown>(value: unknown): value is Record<string, T> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

export class AssertionError extends Error {
  override name = 'AssertionError'
}
