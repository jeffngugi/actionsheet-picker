import type {
  Hierarchy,
  ItemSchema,
  KeyValueItem,
  Row,
  ValueType,
} from '../core/types';

export interface SearchConfig<T> {
  /**
   * `local` filters `items` in the picker (default). `remote` leaves `items`
   * alone and reports the text through `onChangeText` for the app to fetch.
   */
  mode?: 'local' | 'remote';
  /** Called with the search text — debounced in remote mode. */
  onChangeText?: (text: string) => void;
  /** Remote mode debounce in ms. Default 300. */
  debounceMs?: number;
  /** Show a "searching" state (remote mode). */
  searching?: boolean;
  /** Default `true`. */
  accentInsensitive?: boolean;
  /** Replace the default label match (local mode). */
  filter?: (item: T, query: string) => boolean;
  /** Clear the text after each pick in multi-select. Default `false`. */
  clearOnSelect?: boolean;
  /** Clear the text when the sheet closes. Default `true`. */
  clearOnClose?: boolean;
}

export interface PaginationConfig {
  hasMore: boolean;
  loadingMore: boolean;
  onEndReached: () => void;
}

export interface BasePickerOptions<T> {
  items: readonly T[];
  /** Map item fields; defaults to `{ label: 'label', value: 'value', … }`. */
  schema?: Partial<ItemSchema<T>>;
  /** Opt-in hierarchy; omit for plain key–value lists. */
  hierarchy?: Hierarchy;
  /** Allow picking rows that have children. Default `false`. */
  selectableParents?: boolean;
  /**
   * Items for the current value(s) that may not be in `items` yet (edit
   * forms, remote/paginated lists) — used only for labels.
   */
  selectedItems?: readonly T[];

  /** `true` for local search with defaults, or a config object. */
  searchable?: boolean | SearchConfig<T>;
  pagination?: PaginationConfig;

  disabled?: boolean;
  /** Controlled open state. Leave undefined to let the picker manage it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  /** Fired each time the sheet closes — marks the field as touched. */
  onBlur?: () => void;
}

export interface SinglePickerOptions<
  T,
  V extends ValueType,
> extends BasePickerOptions<T> {
  multiple?: false;
  value: V | null | undefined;
  onChange: (value: V | null, item: T | null) => void;
  /** Default `true`. */
  closeOnSelect?: boolean;
  /** Tapping the selected row clears it. Default `false`. */
  allowDeselect?: boolean;
}

export interface MultiPickerOptions<
  T,
  V extends ValueType,
> extends BasePickerOptions<T> {
  multiple: true;
  value: readonly V[] | null | undefined;
  onChange: (values: V[], items: T[]) => void;
  min?: number;
  max?: number;
  /**
   * `done` (default): picks are a draft until `commit()`; closing without
   * committing discards them. `instant`: every tap calls `onChange`.
   */
  confirmMode?: 'done' | 'instant';
  /** Called when a tap is refused because of `min`/`max`. */
  onLimitReached?: (limit: 'min' | 'max') => void;
}

export type PickerOptions<T = KeyValueItem, V extends ValueType = ValueType> =
  SinglePickerOptions<T, V> | MultiPickerOptions<T, V>;

export interface PickerState<T> {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  isMultiple: boolean;
  disabled: boolean;

  query: string;
  setQuery: (text: string) => void;
  /** True when searching is enabled. */
  searchable: boolean;
  searchMode: 'local' | 'remote';
  searching: boolean;

  /** Rows to render (filtered in local mode). */
  rows: Row<T>[];
  /** All rows, unfiltered. */
  allRows: Row<T>[];

  /** Keys currently shown as selected (the draft while a multi sheet is open). */
  selectedKeys: ReadonlySet<string>;
  isSelected: (valueKey: string) => boolean;
  /** Committed selection, resolved through the cache (for the trigger). */
  selectedRows: Row<T>[];
  hasValue: boolean;

  /** Tap handler for a row. Ignores unselectable rows. */
  selectRow: (row: Row<T>) => void;
  /** Remove one committed value (multi chips). */
  removeValue: (value: ValueType) => void;
  /** Clear the committed selection. */
  clear: () => void;
  /** Multi `done` mode: apply the draft and close. */
  commit: () => void;
  /** True in multi `done` mode, where picks need `commit()` to apply. */
  requiresCommit: boolean;
  /** Multi `done` mode: whether the draft differs from the value. */
  isDirty: boolean;
  draftCount: number;

  onEndReached: () => void;
  onMomentumScrollBegin: () => void;
}
