import { describe, expect, it } from '@jest/globals';
import { buildRows } from '../../core/rows';
import { createAccessors } from '../../core/schema';
import type { Row } from '../../core/types';

type Any = Record<string, any>;
const kv = createAccessors<Any>();
const summary = (rows: Row<Any>[]) =>
  rows.map(
    (r) => `${'  '.repeat(r.depth)}${r.label}${r.selectable ? '' : ' (x)'}`
  );

describe('buildRows — key–value (default)', () => {
  it('maps items to depth-0 selectable rows in order', () => {
    const rows = buildRows(
      [
        { label: 'A', value: 'a' },
        { label: 'B', value: 2 },
      ],
      kv
    );
    expect(
      rows.map((r) => [r.key, r.valueKey, r.depth, r.isParent, r.selectable])
    ).toEqual([
      ['0:a', 'a', 0, false, true],
      ['0:2', '2', 0, false, true],
    ]);
  });

  it('dedupes repeated values (e.g. overlapping pages), keeping the first', () => {
    const rows = buildRows(
      [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'One again', value: '1' },
      ],
      kv
    );
    expect(rows.map((r) => r.label)).toEqual(['One', 'Two']);
  });

  it('skips items without a usable value', () => {
    const rows = buildRows(
      [{ label: 'no value' }, { label: 'ok', value: 'ok' }],
      kv
    );
    expect(rows.map((r) => r.label)).toEqual(['ok']);
  });

  it('marks disabled rows unselectable and honours explicit selectable', () => {
    const rows = buildRows(
      [
        { label: 'Disabled', value: 1, disabled: true },
        { label: 'Locked', value: 2, selectable: false },
        { label: 'Disabled wins', value: 3, disabled: true, selectable: true },
      ],
      kv
    );
    expect(rows.map((r) => [r.disabled, r.selectable])).toEqual([
      [true, false],
      [false, false],
      [true, false],
    ]);
  });

  it('passes per-item testID through', () => {
    const [row] = buildRows([{ label: 'A', value: 'a', testID: 'item-a' }], kv);
    expect(row?.testID).toBe('item-a');
  });
});

describe('buildRows — nested hierarchy', () => {
  // Parents carry their children under a custom key (`options`).
  const categories = [
    {
      label: 'Travel',
      value: 10,
      options: [
        { label: 'Taxi', value: 11, parent: 10 },
        { label: 'Flights', value: 12, parent: 10 },
      ],
    },
    { label: 'Meals', value: 20 },
    { label: 'Office', value: 30, options: [] },
  ];
  const hierarchy = {
    type: 'nested',
    childrenKey: 'options',
  } as const;

  it('places children right after their parent; parents unselectable by default', () => {
    const rows = buildRows(categories, kv, { hierarchy });
    expect(summary(rows)).toEqual([
      'Travel (x)',
      '  Taxi',
      '  Flights',
      'Meals',
      'Office',
    ]);
    expect(rows[1]?.parentKey).toBe('10');
  });

  it('allows selecting parents with selectableParents', () => {
    const rows = buildRows(categories, kv, {
      hierarchy,
      selectableParents: true,
    });
    expect(rows[0]?.selectable).toBe(true);
  });

  it('lets a parent opt in with selectable: true', () => {
    const rows = buildRows(
      [
        {
          label: 'P',
          value: 1,
          selectable: true,
          children: [{ label: 'C', value: 2 }],
        },
      ],
      kv,
      { hierarchy: { type: 'nested' } }
    );
    expect(rows[0]?.selectable).toBe(true);
  });

  it('uses `children` as the default children key', () => {
    const rows = buildRows(
      [{ label: 'P', value: 'p', children: [{ label: 'C', value: 'c' }] }],
      kv,
      { hierarchy: { type: 'nested' } }
    );
    expect(summary(rows)).toEqual(['P (x)', '  C']);
  });

  it('merges a parent repeated across pages and dedupes its children', () => {
    const page1 = [
      { label: 'Travel', value: 10, children: [{ label: 'Taxi', value: 11 }] },
    ];
    const page2 = [
      {
        label: 'Travel',
        value: 10,
        children: [
          { label: 'Taxi', value: 11 },
          { label: 'Hotels', value: 13 },
        ],
      },
      { label: 'Meals', value: 20 },
    ];
    const rows = buildRows([...page1, ...page2], kv, {
      hierarchy: { type: 'nested' },
    });
    expect(summary(rows)).toEqual([
      'Travel (x)',
      '  Taxi',
      '  Hotels',
      'Meals',
    ]);
  });

  it('generates unique keys even when values contain colons or repeat across parents', () => {
    const rows = buildRows(
      [
        { label: 'a', value: 'a', children: [{ label: 'b:c', value: 'b:c' }] },
        { label: 'a:b', value: 'a:b', children: [{ label: 'c', value: 'c' }] },
        {
          label: 'x',
          value: 'x',
          children: [{ label: 'other', value: 'other' }],
        },
        {
          label: 'y',
          value: 'y',
          children: [{ label: 'other', value: 'other' }],
        },
      ],
      kv,
      { hierarchy: { type: 'nested' } }
    );
    const keys = rows.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('buildRows — flat hierarchy with parent references', () => {
  const hierarchy = { type: 'flat', parentKey: 'parent_id' } as const;

  it('groups children under parents regardless of input order', () => {
    const rows = buildRows(
      [
        { label: 'Taxi', value: 11, parent_id: 10 },
        { label: 'Travel', value: 10 },
        { label: 'Meals', value: 20, parent_id: null },
        { label: 'Flights', value: 12, parent_id: '10' },
      ],
      kv,
      { hierarchy }
    );
    expect(summary(rows)).toEqual([
      'Travel (x)',
      '  Taxi',
      '  Flights',
      'Meals',
    ]);
  });

  it('keeps orphans visible as top-level rows until their parent loads', () => {
    const rows = buildRows(
      [
        { label: 'Meals', value: 20 },
        { label: 'Taxi', value: 11, parent_id: 10 },
      ],
      kv,
      { hierarchy }
    );
    expect(summary(rows)).toEqual(['Meals', 'Taxi']);
  });

  it('defaults the parent property to `parent` and treats empty string as none', () => {
    const rows = buildRows(
      [
        { label: 'P', value: 'p', parent: '' },
        { label: 'C', value: 'c', parent: 'p' },
      ],
      kv,
      { hierarchy: { type: 'flat' } }
    );
    expect(summary(rows)).toEqual(['P (x)', '  C']);
  });
});
