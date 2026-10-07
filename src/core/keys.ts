import type { ValueType } from './types';

/**
 * Values are compared by their string form so `1` and `'1'` match — APIs
 * routinely return numeric ids that forms then store as strings.
 */
export function keyOf(value: ValueType): string {
  return String(value);
}

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
