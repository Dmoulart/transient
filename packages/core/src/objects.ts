export function mapValues<T extends Record<string, V>, V, R>(object: T, map: (value: V) => R) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, map(value)]))
}

export function mapKeys<T extends Record<string, unknown>>(
  object: T,
  map: (key: keyof T) => string,
): T {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [map(key), value])) as T
}

// Iterate on object keys while keeping the key typed.
// It is more a type helper than a real function.
export function forEachKeys<T extends Record<string, unknown>>(
  object: T,
  callback: (key: keyof T) => void,
): void {
  for (const key in object) {
    callback(key)
  }
}
