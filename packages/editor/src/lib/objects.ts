export function mapObjectValues<T extends Record<string, V>, V, R>(
  object: T,
  map: (value: V) => R,
) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, map(value)]))
}
