export function mapValues<T extends Record<string, V>, V, R>(object: T, map: (value: V) => R) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, map(value)]))
}

export function mapKeys<T extends Record<string, unknown>>(
  object: T,
  map: (key: string) => string,
): T {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [map(key), value])) as T
}
