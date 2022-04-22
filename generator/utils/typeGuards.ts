export function isTruthy<T>(value: T | undefined | null): value is T {
  return Boolean(value);
}

export function hasOwnProperty<T, K extends PropertyKey>(
  obj: T,
  property: K
): obj is T & Record<K, T> {
  return !obj || !property ? false : Object.prototype.hasOwnProperty.call(obj, property);
}
