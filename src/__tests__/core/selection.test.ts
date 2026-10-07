import { describe, expect, it } from '@jest/globals';
import {
  normalizeMulti,
  removeMulti,
  selectSingle,
  toKeySet,
  toggleMulti,
} from '../../core/selection';

describe('toKeySet', () => {
  it('handles nil, single and multiple values, comparing by string form', () => {
    expect(toKeySet(null).size).toBe(0);
    expect(toKeySet(undefined).size).toBe(0);
    expect([...toKeySet(5)]).toEqual(['5']);
    expect(toKeySet(['1', 1, 2]).has('1')).toBe(true);
    expect(toKeySet(['1', 1, 2]).size).toBe(2);
  });

  it('treats 0 as a real value', () => {
    expect(toKeySet(0).has('0')).toBe(true);
  });
});

describe('normalizeMulti', () => {
  it('removes duplicates by key and nils, keeping first-seen order', () => {
    expect(normalizeMulti([3, '3', 1, null as any, 1])).toEqual([3, 1]);
    expect(normalizeMulti(null)).toEqual([]);
  });
});

describe('selectSingle', () => {
  it('selects a new value', () => {
    expect(selectSingle('a', 'b')).toEqual({ value: 'b', changed: true });
    expect(selectSingle(null, 'b')).toEqual({ value: 'b', changed: true });
  });

  it('is a no-op when re-picking the current value (string/number agnostic)', () => {
    expect(selectSingle(1, '1' as any)).toEqual({ value: 1, changed: false });
  });

  it('clears on re-pick when allowDeselect is set', () => {
    expect(selectSingle('a', 'a', true)).toEqual({
      value: null,
      changed: true,
    });
  });
});

describe('toggleMulti', () => {
  it('adds and removes values', () => {
    expect(toggleMulti(['a'], 'b')).toEqual({
      values: ['a', 'b'],
      changed: true,
    });
    expect(toggleMulti(['a', 'b'], 'a')).toEqual({
      values: ['b'],
      changed: true,
    });
  });

  it('starts from an empty selection', () => {
    expect(toggleMulti(undefined, 'a').values).toEqual(['a']);
  });

  it('refuses to exceed max', () => {
    expect(toggleMulti(['a', 'b'], 'c', { max: 2 })).toEqual({
      values: ['a', 'b'],
      changed: false,
      blockedBy: 'max',
    });
    // removing is still allowed at max
    expect(toggleMulti(['a', 'b'], 'a', { max: 2 }).values).toEqual(['b']);
  });

  it('refuses to go below min', () => {
    expect(toggleMulti(['a'], 'a', { min: 1 })).toEqual({
      values: ['a'],
      changed: false,
      blockedBy: 'min',
    });
  });

  it('never mutates the caller array', () => {
    const current = ['a'];
    toggleMulti(current, 'b');
    toggleMulti(current, 'a');
    expect(current).toEqual(['a']);
  });
});

describe('removeMulti', () => {
  // react-native-dropdown-picker discards its filter() result, so pressing a
  // badge never removes it. Guard against the same bug here.
  it('actually removes the value', () => {
    expect(removeMulti(['a', 'b', 'c'], 'b')).toEqual({
      values: ['a', 'c'],
      changed: true,
    });
  });

  it('honours min and ignores unknown values', () => {
    expect(removeMulti(['a'], 'a', { min: 1 }).blockedBy).toBe('min');
    expect(removeMulti(['a'], 'z')).toEqual({ values: ['a'], changed: false });
  });
});
