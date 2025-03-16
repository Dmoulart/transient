export function isArrayOfType<T>(
  isOfType: (value: unknown) => value is T,
  items: unknown
): items is Array<T> {
  if (!Array.isArray(items)) {
    return false;
  }

  if (!items.every(isOfType)) {
    return false;
  }

  return true;
}
