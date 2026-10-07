import { describe, expect, it } from '@jest/globals';
import { createAccessors } from '../../core/schema';

describe('createAccessors', () => {
  it('reads key–value items by default', () => {
    const a = createAccessors<{ label: string; value: string }>();
    const item = { label: 'Kenya', value: 'KE' };
    expect(a.label(item)).toBe('Kenya');
    expect(a.value(item)).toBe('KE');
    expect(a.disabled(item)).toBe(false);
    expect(a.selectable(item)).toBeUndefined();
    expect(a.testID(item)).toBeUndefined();
  });

  it('maps custom property names so raw API objects work', () => {
    const a = createAccessors<{
      id: number;
      bank_name: string;
      active: boolean;
    }>({
      value: 'id',
      label: 'bank_name',
    });
    const item = { id: 7, bank_name: 'Equity', active: true };
    expect(a.value(item)).toBe(7);
    expect(a.label(item)).toBe('Equity');
  });

  it('accepts function accessors for computed fields', () => {
    const a = createAccessors<{ id: number; first: string; last: string }>({
      value: (u) => u.id,
      label: (u) => `${u.first} ${u.last}`,
    });
    expect(a.label({ id: 1, first: 'Jane', last: 'Doe' })).toBe('Jane Doe');
  });

  it('treats missing or non-primitive values as unusable', () => {
    const a = createAccessors<Record<string, unknown>>();
    expect(a.value({ label: 'x' })).toBeUndefined();
    expect(a.value({ label: 'x', value: null })).toBeUndefined();
    expect(a.value({ label: 'x', value: { id: 1 } })).toBeUndefined();
    expect(a.value({ label: 'x', value: 0 })).toBe(0);
  });

  it('stringifies labels and tolerates missing ones', () => {
    const a = createAccessors<Record<string, unknown>>();
    expect(a.label({ value: 1, label: 2024 })).toBe('2024');
    expect(a.label({ value: 1 })).toBe('');
  });

  it('only accepts real booleans for disabled/selectable', () => {
    const a = createAccessors<Record<string, unknown>>();
    expect(a.disabled({ disabled: 'yes' })).toBe(false);
    expect(a.disabled({ disabled: true })).toBe(true);
    expect(a.selectable({ selectable: 1 })).toBeUndefined();
    expect(a.selectable({ selectable: false })).toBe(false);
  });
});
