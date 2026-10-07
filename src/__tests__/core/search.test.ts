import { describe, expect, it } from '@jest/globals';
import { buildRows } from '../../core/rows';
import { createAccessors } from '../../core/schema';
import { buildSearchIndex, filterRows, normalizeText } from '../../core/search';
import type { Row } from '../../core/types';

type Any = Record<string, any>;
const kv = createAccessors<Any>();
const labels = (rows: Row<Any>[]) => rows.map((r) => r.label);

const flatRows = buildRows(
  [
    { label: 'Kenya', value: 'KE' },
    { label: 'Uganda', value: 'UG' },
    { label: 'Côte d’Ivoire', value: 'CI' },
    { label: 'Tanzania', value: 'TZ' },
  ],
  kv
);

const treeRows = buildRows(
  [
    {
      label: 'Travel',
      value: 10,
      children: [
        { label: 'Taxi', value: 11 },
        { label: 'Flights', value: 12 },
      ],
    },
    {
      label: 'Meals',
      value: 20,
      children: [{ label: 'Team lunch', value: 21 }],
    },
    { label: 'Taxes', value: 30 },
  ],
  kv,
  { hierarchy: { type: 'nested' } }
);

const search = (rows: Row<Any>[], q: string, opts = {}) =>
  labels(filterRows(rows, buildSearchIndex(rows), q, opts));

describe('normalizeText', () => {
  it('lower-cases and strips accents by default', () => {
    expect(normalizeText('CÔTE')).toBe('cote');
    expect(normalizeText('CÔTE', false)).toBe('côte');
  });
});

describe('filterRows — flat lists', () => {
  it('returns the input untouched for an empty or blank query', () => {
    expect(filterRows(flatRows, buildSearchIndex(flatRows), '   ')).toBe(
      flatRows
    );
  });

  it('matches case-insensitively anywhere in the label', () => {
    expect(search(flatRows, 'AN')).toEqual(['Uganda', 'Tanzania']);
  });

  it('matches accented labels from unaccented input', () => {
    expect(search(flatRows, 'cote')).toEqual(['Côte d’Ivoire']);
  });

  it('can be made accent-sensitive', () => {
    const index = buildSearchIndex(flatRows, false);
    expect(
      labels(filterRows(flatRows, index, 'cote', { accentInsensitive: false }))
    ).toEqual([]);
  });

  it('supports a custom filter that receives the trimmed raw query', () => {
    const seen: string[] = [];
    const result = search(flatRows, '  KE ', {
      filter: (item: Any, q: string) => {
        seen.push(q);
        return item.value === q;
      },
    });
    expect(result).toEqual(['Kenya']);
    expect(seen.every((q) => q === 'KE')).toBe(true);
  });
});

describe('filterRows — hierarchy', () => {
  it('brings the parent along when only a child matches', () => {
    expect(search(treeRows, 'flight')).toEqual(['Travel', 'Flights']);
  });

  it('shows all children when the parent matches', () => {
    expect(search(treeRows, 'travel')).toEqual(['Travel', 'Taxi', 'Flights']);
  });

  it('searches child labels (not just parents) and keeps groups in order', () => {
    expect(search(treeRows, 'ta')).toEqual(['Travel', 'Taxi', 'Taxes']);
  });

  it('drops groups with no matches', () => {
    expect(search(treeRows, 'lunch')).toEqual(['Meals', 'Team lunch']);
    expect(search(treeRows, 'zzz')).toEqual([]);
  });
});
