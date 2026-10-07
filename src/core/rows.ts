import { isNil, keyOf } from './keys';
import type { ItemAccessors } from './schema';
import type { Hierarchy, Row, ValueType } from './types';

export interface BuildRowsOptions {
  /** Omit for plain key–value lists (the default). */
  hierarchy?: Hierarchy;
  /** Whether rows that have children can themselves be picked. Default `false`. */
  selectableParents?: boolean;
}

interface Group<T> {
  item: T;
  value: ValueType;
  valueKey: string;
  children: T[];
  childKeys: Set<string>;
}

const topKey = (valueKey: string) => `0:${valueKey}`;
// Length-prefixed so values containing ':' can never produce colliding keys.
const childKey = (parentKey: string, valueKey: string) =>
  `1:${parentKey.length}:${parentKey}:${valueKey}`;

/**
 * Normalises any supported input shape into one ordered list of rows
 * (parents immediately followed by their children). Items repeated across
 * pages are merged rather than duplicated, and items without a usable value
 * are skipped.
 */
export function buildRows<T>(
  items: readonly T[],
  accessors: ItemAccessors<T>,
  options: BuildRowsOptions = {}
): Row<T>[] {
  const { hierarchy, selectableParents = false } = options;

  const makeRow = (
    item: T,
    value: ValueType,
    depth: 0 | 1,
    isParent: boolean,
    parentKey: string | null
  ): Row<T> => {
    const valueKey = keyOf(value);
    const disabled = accessors.disabled(item);
    const explicit = accessors.selectable(item);
    const selectable = disabled
      ? false
      : (explicit ?? (isParent ? selectableParents : true));
    const testID = accessors.testID(item);
    return {
      key:
        parentKey === null ? topKey(valueKey) : childKey(parentKey, valueKey),
      valueKey,
      value,
      label: accessors.label(item),
      item,
      depth,
      isParent,
      parentKey,
      disabled,
      selectable,
      ...(testID === undefined ? null : { testID }),
    };
  };

  if (!hierarchy) {
    const seen = new Set<string>();
    const rows: Row<T>[] = [];
    for (const item of items) {
      const value = accessors.value(item);
      if (value === undefined || seen.has(keyOf(value))) continue;
      seen.add(keyOf(value));
      rows.push(makeRow(item, value, 0, false, null));
    }
    return rows;
  }

  const groups = new Map<string, Group<T>>();
  const order: Group<T>[] = [];
  const addGroup = (item: T, value: ValueType): Group<T> => {
    const valueKey = keyOf(value);
    let group = groups.get(valueKey);
    if (!group) {
      group = { item, value, valueKey, children: [], childKeys: new Set() };
      groups.set(valueKey, group);
      order.push(group);
    }
    return group;
  };
  const addChild = (group: Group<T>, child: T) => {
    const value = accessors.value(child);
    if (value === undefined || group.childKeys.has(keyOf(value))) return;
    group.childKeys.add(keyOf(value));
    group.children.push(child);
  };

  if (hierarchy.type === 'nested') {
    const childrenKey = hierarchy.childrenKey ?? 'children';
    for (const item of items) {
      const value = accessors.value(item);
      if (value === undefined) continue;
      const group = addGroup(item, value);
      const children = (item as Record<string, unknown> | null)?.[childrenKey];
      if (Array.isArray(children)) {
        for (const child of children as T[]) addChild(group, child);
      }
    }
  } else {
    const parentProp = hierarchy.parentKey ?? 'parent';
    const pending: { parentKey: string; item: T }[] = [];
    for (const item of items) {
      const value = accessors.value(item);
      if (value === undefined) continue;
      const parent = (item as Record<string, unknown> | null)?.[parentProp];
      if (isNil(parent) || parent === '') addGroup(item, value);
      else pending.push({ parentKey: keyOf(parent as ValueType), item });
    }
    for (const { parentKey, item } of pending) {
      const group = groups.get(parentKey);
      if (group) {
        addChild(group, item);
      } else {
        // Parent not loaded (yet) — keep the item visible as a top-level row
        // rather than dropping it; it regroups once its parent arrives.
        const value = accessors.value(item) as ValueType;
        addGroup(item, value);
      }
    }
  }

  const rows: Row<T>[] = [];
  for (const group of order) {
    const isParent = group.children.length > 0;
    rows.push(makeRow(group.item, group.value, 0, isParent, null));
    for (const child of group.children) {
      rows.push(
        makeRow(
          child,
          accessors.value(child) as ValueType,
          1,
          false,
          group.valueKey
        )
      );
    }
  }
  return rows;
}
