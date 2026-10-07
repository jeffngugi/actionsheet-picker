import type { Row } from './types';

/**
 * Remembers every row the picker has seen, keyed by value, so the trigger
 * can still show the selected label after the item drops out of `items`
 * (remote search results, a different page, an edit form whose saved value
 * hasn't been fetched yet).
 */
export class ItemCache<T> {
  private readonly rows = new Map<string, Row<T>>();

  /**
   * `overwrite: true` (rows from the current `items`) replaces older entries
   * so labels stay fresh; `false` (seeded `selectedItems`) only fills gaps.
   */
  remember(rows: readonly Row<T>[], overwrite = true): void {
    for (const row of rows) {
      if (overwrite || !this.rows.has(row.valueKey)) {
        this.rows.set(row.valueKey, row);
      }
    }
  }

  get(valueKey: string): Row<T> | undefined {
    return this.rows.get(valueKey);
  }

  /** Rows for the given keys, in the given order; unknown keys are skipped. */
  resolve(valueKeys: Iterable<string>): Row<T>[] {
    const out: Row<T>[] = [];
    for (const key of valueKeys) {
      const row = this.rows.get(key);
      if (row) out.push(row);
    }
    return out;
  }

  get size(): number {
    return this.rows.size;
  }
}
