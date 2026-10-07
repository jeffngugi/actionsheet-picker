import { isNil, keyOf } from './keys';
import type { ValueType } from './types';

export type SelectionValue =
  ValueType | readonly ValueType[] | null | undefined;

/** Keys of the current selection, for O(1) `isSelected` checks. */
export function toKeySet(value: SelectionValue): Set<string> {
  if (isNil(value)) return new Set();
  if (Array.isArray(value)) return new Set(value.map(keyOf));
  return new Set([keyOf(value as ValueType)]);
}

/** Multi-select values with duplicates (by key) and nils removed, order kept. */
export function normalizeMulti<V extends ValueType>(
  value: readonly V[] | null | undefined
): V[] {
  if (!value) return [];
  const seen = new Set<string>();
  const out: V[] = [];
  for (const v of value) {
    if (isNil(v) || seen.has(keyOf(v))) continue;
    seen.add(keyOf(v));
    out.push(v);
  }
  return out;
}

export interface SelectResult<V> {
  value: V;
  changed: boolean;
}

/**
 * Single select. Picking the already-selected value is a no-op unless
 * `allowDeselect` is set, in which case it clears the selection.
 */
export function selectSingle<V extends ValueType>(
  current: V | null | undefined,
  next: V,
  allowDeselect = false
): SelectResult<V | null> {
  const same = !isNil(current) && keyOf(current) === keyOf(next);
  if (same)
    return allowDeselect
      ? { value: null, changed: true }
      : { value: current, changed: false };
  return { value: next, changed: true };
}

export interface ToggleLimits {
  min?: number;
  max?: number;
}

export interface ToggleResult<V> {
  values: V[];
  changed: boolean;
  /** Why the toggle was refused, if it was. */
  blockedBy?: 'min' | 'max';
}

/** Adds or removes `value`, refusing to go below `min` or above `max`. */
export function toggleMulti<V extends ValueType>(
  current: readonly V[] | null | undefined,
  value: V,
  { min, max }: ToggleLimits = {}
): ToggleResult<V> {
  const values = normalizeMulti(current);
  const index = values.findIndex((v) => keyOf(v) === keyOf(value));

  if (index > -1) {
    if (min !== undefined && values.length <= min) {
      return { values, changed: false, blockedBy: 'min' };
    }
    values.splice(index, 1);
    return { values, changed: true };
  }

  if (max !== undefined && values.length >= max) {
    return { values, changed: false, blockedBy: 'max' };
  }
  values.push(value);
  return { values, changed: true };
}

/** Removes one value (e.g. a chip's ✕), honouring `min`. */
export function removeMulti<V extends ValueType>(
  current: readonly V[] | null | undefined,
  value: V,
  { min }: ToggleLimits = {}
): ToggleResult<V> {
  const values = normalizeMulti(current);
  const index = values.findIndex((v) => keyOf(v) === keyOf(value));
  if (index === -1) return { values, changed: false };
  if (min !== undefined && values.length <= min) {
    return { values, changed: false, blockedBy: 'min' };
  }
  values.splice(index, 1);
  return { values, changed: true };
}
