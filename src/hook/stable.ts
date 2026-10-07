import { useRef } from 'react';

/** Always points at the latest value without changing identity. */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function shallowEqualObject(a: object | undefined, b: object | undefined) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) =>
      Object.prototype.hasOwnProperty.call(b, k) &&
      Object.is((a as any)[k], (b as any)[k])
  );
}

function shallowEqualArray(
  a: readonly unknown[] | undefined,
  b: readonly unknown[] | undefined
) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

/**
 * Keeps the previous reference while the new value is shallowly equal, so
 * inline props like `schema={{ value: 'id' }}` don't invalidate memos.
 */
export function useShallowStable<T extends object | undefined>(value: T): T {
  const ref = useRef(value);
  if (!shallowEqualObject(ref.current, value)) ref.current = value;
  return ref.current;
}

/**
 * Same for arrays compared element-by-element (by identity), so
 * `items={pages.flat()}` only rebuilds rows when an item actually changes.
 */
export function useShallowStableArray<T extends readonly unknown[] | undefined>(
  value: T
): T {
  const ref = useRef(value);
  if (!shallowEqualArray(ref.current, value)) ref.current = value;
  return ref.current;
}
