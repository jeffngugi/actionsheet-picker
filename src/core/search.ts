import type { Row } from './types';

export interface SearchOptions<T> {
  /** Match "Café" when typing "cafe". Default `true`. */
  accentInsensitive?: boolean;
  /** Replace the default label `includes` match. Receives the raw query. */
  filter?: (item: T, query: string) => boolean;
}

const COMBINING_MARKS = /[̀-ͯ]/g;
const canNormalize = (() => {
  try {
    return 'é'.normalize('NFD') !== 'é';
  } catch {
    return false; // engines built without Intl/normalize support
  }
})();

export function normalizeText(text: string, accentInsensitive = true): string {
  const lower = text.toLowerCase();
  return accentInsensitive && canNormalize
    ? lower.normalize('NFD').replace(COMBINING_MARKS, '')
    : lower;
}

/**
 * Precomputes the normalised label of every row once per rows/options
 * change, so each keystroke is a plain substring scan.
 */
export function buildSearchIndex<T>(
  rows: readonly Row<T>[],
  accentInsensitive = true
): string[] {
  return rows.map((row) => normalizeText(row.label, accentInsensitive));
}

/**
 * Filters rows while keeping hierarchy intact: a matching child brings its
 * parent along, and a matching parent brings all of its children.
 */
export function filterRows<T>(
  rows: readonly Row<T>[],
  index: readonly string[],
  query: string,
  options: SearchOptions<T> = {}
): Row<T>[] {
  const trimmed = query.trim();
  if (!trimmed) return rows as Row<T>[];

  const needle = normalizeText(trimmed, options.accentInsensitive ?? true);
  const { filter } = options;
  const matches = (i: number): boolean => {
    const row = rows[i] as Row<T>;
    return filter
      ? filter(row.item, trimmed)
      : (index[i] ?? '').includes(needle);
  };

  const out: Row<T>[] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i] as Row<T>;
    if (!row.isParent) {
      if (matches(i)) out.push(row);
      i += 1;
      continue;
    }

    let end = i + 1;
    while (end < rows.length && (rows[end] as Row<T>).depth === 1) end += 1;

    if (matches(i)) {
      for (let j = i; j < end; j += 1) out.push(rows[j] as Row<T>);
    } else {
      const hits: Row<T>[] = [];
      for (let j = i + 1; j < end; j += 1) {
        if (matches(j)) hits.push(rows[j] as Row<T>);
      }
      if (hits.length) out.push(row, ...hits);
    }
    i = end;
  }
  return out;
}
