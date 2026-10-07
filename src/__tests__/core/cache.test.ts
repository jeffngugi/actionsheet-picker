import { describe, expect, it } from '@jest/globals';
import { ItemCache } from '../../core/cache';
import { buildRows } from '../../core/rows';
import { createAccessors } from '../../core/schema';

type Any = Record<string, any>;
const kv = createAccessors<Any>();
const rows = (items: Any[]) => buildRows(items, kv);

describe('ItemCache', () => {
  it('keeps a selected label after the item drops out of the list', () => {
    const cache = new ItemCache<Any>();
    cache.remember(rows([{ label: 'Jane', value: 7 }])); // page 1 / first search
    cache.remember(rows([{ label: 'John', value: 8 }])); // next search result
    expect(cache.get('7')?.label).toBe('Jane');
  });

  // react-native-dropdown-picker never seeds single-select labels on mount
  // (its check requires an array). A seeded value must resolve immediately.
  it('resolves a seeded single value before any items load', () => {
    const cache = new ItemCache<Any>();
    cache.remember(rows([{ label: 'Saved bank', value: 'b1' }]), false);
    expect(cache.get('b1')?.label).toBe('Saved bank');
  });

  it('lets fresh items overwrite seeds but not the other way round', () => {
    const cache = new ItemCache<Any>();
    cache.remember(rows([{ label: 'Old name', value: 1 }]), false);
    cache.remember(rows([{ label: 'New name', value: 1 }]));
    expect(cache.get('1')?.label).toBe('New name');
    cache.remember(rows([{ label: 'Stale seed', value: 1 }]), false);
    expect(cache.get('1')?.label).toBe('New name');
  });

  it('resolves keys in the requested order, skipping unknown ones', () => {
    const cache = new ItemCache<Any>();
    cache.remember(
      rows([
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ])
    );
    expect(cache.resolve(['b', 'zz', 'a']).map((r) => r.label)).toEqual([
      'B',
      'A',
    ]);
    expect(cache.size).toBe(2);
  });

  it('remembers child rows of a hierarchy with their parent', () => {
    const cache = new ItemCache<Any>();
    cache.remember(
      buildRows(
        [
          {
            label: 'Travel',
            value: 10,
            children: [{ label: 'Taxi', value: 11 }],
          },
        ],
        kv,
        {
          hierarchy: { type: 'nested' },
        }
      )
    );
    expect(cache.get('11')?.parentKey).toBe('10');
  });
});
