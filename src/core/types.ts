export type ValueType = string | number;

/** Default item shape: a plain key–value pair. */
export interface KeyValueItem<V extends ValueType = ValueType> {
  label: string;
  value: V;
  disabled?: boolean;
  selectable?: boolean;
  testID?: string;
}

/**
 * How to read each field from an item: a property name, or a function for
 * computed values (e.g. `label: (u) => `${u.first} ${u.last}``).
 */
export type Accessor<T, R> = string | ((item: T) => R);

export interface ItemSchema<T> {
  label: Accessor<T, string>;
  value: Accessor<T, ValueType>;
  disabled: Accessor<T, boolean | undefined>;
  selectable: Accessor<T, boolean | undefined>;
  testID: Accessor<T, string | undefined>;
}

export type Hierarchy =
  /** Parents carry their children in an array property (default `children`). */
  | { type: 'nested'; childrenKey?: string }
  /** Every item is top-level; children point at their parent's value (default `parent`). */
  | { type: 'flat'; parentKey?: string };

export interface Row<T> {
  /** Unique, stable list key. */
  key: string;
  /** `String(value)` — what selection and the cache are keyed by. */
  valueKey: string;
  value: ValueType;
  label: string;
  item: T;
  depth: 0 | 1;
  /** Has at least one child row. */
  isParent: boolean;
  /** `valueKey` of the parent row, for children. */
  parentKey: string | null;
  disabled: boolean;
  /** Can be picked (false for disabled rows and, by default, parent rows). */
  selectable: boolean;
  testID?: string;
}
