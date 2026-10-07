import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ItemCache } from '../core/cache';
import { debounce } from '../core/debounce';
import { keyOf } from '../core/keys';
import { buildRows } from '../core/rows';
import { createAccessors } from '../core/schema';
import { buildSearchIndex, filterRows } from '../core/search';
import {
  normalizeMulti,
  removeMulti,
  selectSingle,
  toggleMulti,
} from '../core/selection';
import type { KeyValueItem, Row, ValueType } from '../core/types';
import { useLatest, useShallowStable, useShallowStableArray } from './stable';
import type { PickerOptions, PickerState, SearchConfig } from './types';

const DEFAULT_DEBOUNCE_MS = 300;

/** Ordered, de-duplicated keys of the committed value. */
function valueKeys(value: unknown, multiple: boolean): string[] {
  if (multiple) {
    return normalizeMulti(value as ValueType[] | null | undefined).map(keyOf);
  }
  return value === null || value === undefined
    ? []
    : [keyOf(value as ValueType)];
}

function sameKeys(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const k of a) if (!b.has(k)) return false;
  return true;
}

/**
 * Headless picker state: open/close, search (local or remote), hierarchy,
 * single/multi selection, the selected-item cache and pagination. Renders
 * nothing — the default UI and custom UIs are built on top of it.
 */
export function useActionSheetPicker<
  T = KeyValueItem,
  V extends ValueType = ValueType,
>(options: PickerOptions<T, V>): PickerState<T> {
  const latest = useLatest(options);
  const isMultiple = options.multiple === true;
  const disabled = options.disabled ?? false;
  const usesDraft =
    options.multiple === true && (options.confirmMode ?? 'done') === 'done';

  // ── search config ─────────────────────────────────────────────────────
  const searchCfg: SearchConfig<T> | undefined =
    typeof options.searchable === 'object' ? options.searchable : undefined;
  const searchable = Boolean(options.searchable);
  const searchMode = searchCfg?.mode ?? 'local';
  const accentInsensitive = searchCfg?.accentInsensitive ?? true;
  const hasCustomFilter = Boolean(searchCfg?.filter);
  const clearOnClose = searchCfg?.clearOnClose ?? true;
  const debounceMs = searchCfg?.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  // ── open state (controlled or uncontrolled) ──────────────────────────
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = options.open !== undefined ? options.open : innerOpen;
  const isOpenRef = useLatest(isOpen);

  const setOpen = useCallback(
    (next: boolean) => {
      const o = latest.current;
      if (next && o.disabled) return;
      if (next === isOpenRef.current) return;
      if (o.open === undefined) setInnerOpen(next);
      o.onOpenChange?.(next);
    },
    [latest, isOpenRef]
  );
  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(
    () => setOpen(!isOpenRef.current),
    [setOpen, isOpenRef]
  );

  // ── rows + cache ─────────────────────────────────────────────────────
  const items = useShallowStableArray(options.items);
  const selectedItems = useShallowStableArray(options.selectedItems);
  const schema = useShallowStable(options.schema);
  const hierarchy = useShallowStable(options.hierarchy);
  const selectableParents = options.selectableParents ?? false;

  const accessors = useMemo(() => createAccessors<T>(schema), [schema]);
  const cacheRef = useRef<ItemCache<T> | null>(null);
  if (cacheRef.current === null) cacheRef.current = new ItemCache<T>();
  const cache = cacheRef.current;

  // Builds rows and feeds the cache in one place. `resolve` gets a new
  // identity whenever the cache may have learned labels, so anything that
  // reads selected labels just depends on it. Remembering is idempotent, so
  // StrictMode's double render is harmless.
  const { allRows, resolve } = useMemo(() => {
    const built = buildRows(items, accessors, {
      hierarchy,
      selectableParents,
    });
    cache.remember(built);
    if (selectedItems?.length) {
      cache.remember(buildRows(selectedItems, accessors), false);
    }
    return {
      allRows: built,
      resolve: (keys: Iterable<string>) => cache.resolve(keys),
    };
  }, [items, selectedItems, accessors, hierarchy, selectableParents, cache]);

  // ── query ────────────────────────────────────────────────────────────
  const [query, setQueryState] = useState('');
  const lastSentRef = useRef('');

  const sendRemote = useCallback(
    (text: string) => {
      lastSentRef.current = text;
      const cfg = latest.current.searchable;
      if (typeof cfg === 'object') cfg.onChangeText?.(text);
    },
    [latest]
  );
  const debouncedSend = useMemo(
    () => debounce(sendRemote, debounceMs),
    [sendRemote, debounceMs]
  );
  useEffect(() => () => debouncedSend.cancel(), [debouncedSend]);

  const setQuery = useCallback(
    (text: string) => {
      setQueryState(text);
      const cfg = latest.current.searchable;
      if (typeof cfg !== 'object') return;
      if ((cfg.mode ?? 'local') === 'remote') debouncedSend(text);
      else cfg.onChangeText?.(text);
    },
    [latest, debouncedSend]
  );

  const searchIndex = useMemo(
    () =>
      searchable && searchMode === 'local'
        ? buildSearchIndex(allRows, accentInsensitive)
        : null,
    [searchable, searchMode, allRows, accentInsensitive]
  );

  const rows = useMemo(() => {
    if (!searchIndex) return allRows;
    const filter = hasCustomFilter
      ? (item: T, q: string) => {
          const cfg = latest.current.searchable;
          return typeof cfg === 'object' && cfg.filter
            ? cfg.filter(item, q)
            : true;
        }
      : undefined;
    return filterRows(allRows, searchIndex, query, {
      accentInsensitive,
      filter,
    });
  }, [allRows, searchIndex, query, accentInsensitive, hasCustomFilter, latest]);

  // ── selection ────────────────────────────────────────────────────────
  // Keyed on a JSON signature so an inline `value={[...]}` doesn't produce a
  // new Set (and re-render every row) on each parent render.
  const signature = JSON.stringify(valueKeys(options.value, isMultiple));
  const committedKeys = useMemo(
    () => new Set<string>(JSON.parse(signature)),
    [signature]
  );

  const [draft, setDraft] = useState<V[]>([]);
  const draftRef = useLatest(draft);
  const draftKeys = useMemo(() => new Set(draft.map(keyOf)), [draft]);

  // Reset per-session state when the sheet opens/closes (render-phase
  // derivation, so the first open frame already shows the right draft).
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen && usesDraft) {
      setDraft(normalizeMulti(options.value as readonly V[] | null));
    }
    if (!isOpen && clearOnClose) setQueryState('');
  }

  const selectedKeys = usesDraft && isOpen ? draftKeys : committedKeys;
  const isSelected = useCallback(
    (valueKey: string) => selectedKeys.has(valueKey),
    [selectedKeys]
  );

  const selectedRows = useMemo(
    () => resolve(committedKeys),
    [resolve, committedKeys]
  );

  const resolveItems = useCallback(
    (values: readonly ValueType[]) =>
      resolve(values.map(keyOf)).map((r) => r.item),
    [resolve]
  );

  const selectRow = useCallback(
    (row: Row<T>) => {
      if (!row.selectable) return;
      const o = latest.current;

      if (o.multiple === true) {
        const limits = { min: o.min, max: o.max };
        const draftMode = (o.confirmMode ?? 'done') === 'done';
        const base = draftMode
          ? draftRef.current
          : normalizeMulti(o.value as readonly V[] | null);
        const result = toggleMulti(base, row.value as V, limits);
        if (result.blockedBy) {
          o.onLimitReached?.(result.blockedBy);
          return;
        }
        if (draftMode) setDraft(result.values);
        else o.onChange(result.values, resolveItems(result.values));
        if (typeof o.searchable === 'object' && o.searchable.clearOnSelect) {
          setQuery('');
        }
        return;
      }

      const result = selectSingle(
        o.value as V | null | undefined,
        row.value as V,
        o.allowDeselect
      );
      if (result.changed) {
        o.onChange(result.value, result.value === null ? null : row.item);
      }
      if (o.closeOnSelect ?? true) setOpen(false);
    },
    [latest, draftRef, resolveItems, setQuery, setOpen]
  );

  const commit = useCallback(() => {
    const o = latest.current;
    if (o.multiple !== true || (o.confirmMode ?? 'done') !== 'done') return;
    const values = draftRef.current;
    const committed = new Set(valueKeys(o.value, true));
    if (!sameKeys(new Set(values.map(keyOf)), committed)) {
      o.onChange(values, resolveItems(values));
    }
    setOpen(false);
  }, [latest, draftRef, resolveItems, setOpen]);

  const removeValue = useCallback(
    (value: ValueType) => {
      const o = latest.current;
      if (o.multiple === true) {
        const result = removeMulti(o.value as readonly V[] | null, value as V, {
          min: o.min,
        });
        if (result.blockedBy) o.onLimitReached?.(result.blockedBy);
        else if (result.changed) {
          o.onChange(result.values, resolveItems(result.values));
        }
        return;
      }
      if (o.value !== null && o.value !== undefined) {
        if (keyOf(o.value) === keyOf(value)) o.onChange(null, null);
      }
    },
    [latest, resolveItems]
  );

  const clear = useCallback(() => {
    const o = latest.current;
    if (o.multiple === true) {
      // Inside an open `done` sheet, "clear" resets the draft only.
      if ((o.confirmMode ?? 'done') === 'done' && isOpenRef.current) {
        setDraft([]);
      } else if (valueKeys(o.value, true).length) {
        o.onChange([], []);
      }
      return;
    }
    if (o.value !== null && o.value !== undefined) o.onChange(null, null);
  }, [latest, isOpenRef]);

  // ── pagination ───────────────────────────────────────────────────────
  const endLockRef = useRef(false);
  const loadingMore = options.pagination?.loadingMore ?? false;
  useEffect(() => {
    // A page finished (or more rows arrived): allow the next request.
    if (!loadingMore) endLockRef.current = false;
  }, [loadingMore, allRows.length]);

  const onEndReached = useCallback(() => {
    const pg = latest.current.pagination;
    if (!pg || !pg.hasMore || pg.loadingMore || endLockRef.current) return;
    endLockRef.current = true;
    pg.onEndReached();
  }, [latest]);

  const onMomentumScrollBegin = useCallback(() => {
    endLockRef.current = false;
  }, []);

  // ── lifecycle callbacks ──────────────────────────────────────────────
  const prevOpenForEffects = useRef(isOpen);
  useEffect(() => {
    if (prevOpenForEffects.current === isOpen) return;
    prevOpenForEffects.current = isOpen;
    const o = latest.current;
    if (isOpen) {
      o.onOpen?.();
      return;
    }
    if (clearOnClose) {
      debouncedSend.cancel();
      // Remote lists were filtered by the last query; reset them for next time.
      if (searchMode === 'remote' && lastSentRef.current !== '') {
        sendRemote('');
      }
    }
    o.onClose?.();
    o.onBlur?.();
  }, [isOpen, latest, clearOnClose, searchMode, debouncedSend, sendRemote]);

  useEffect(() => {
    if (disabled && isOpen) setOpen(false);
  }, [disabled, isOpen, setOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    isMultiple,
    disabled,
    query,
    setQuery,
    searchable,
    searchMode,
    searching: searchCfg?.searching ?? false,
    rows,
    allRows,
    selectedKeys,
    isSelected,
    selectedRows,
    hasValue: committedKeys.size > 0,
    selectRow,
    removeValue,
    clear,
    commit,
    isDirty: usesDraft && isOpen && !sameKeys(draftKeys, committedKeys),
    draftCount: usesDraft && isOpen ? draftKeys.size : committedKeys.size,
    onEndReached,
    onMomentumScrollBegin,
  };
}
