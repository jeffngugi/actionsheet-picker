import { isNil } from './keys';
import type { Accessor, ItemSchema, ValueType } from './types';

export const DEFAULT_SCHEMA: ItemSchema<any> = {
  label: 'label',
  value: 'value',
  disabled: 'disabled',
  selectable: 'selectable',
  testID: 'testID',
};

export interface ItemAccessors<T> {
  label: (item: T) => string;
  /** `undefined` when the item has no usable value. */
  value: (item: T) => ValueType | undefined;
  disabled: (item: T) => boolean;
  selectable: (item: T) => boolean | undefined;
  testID: (item: T) => string | undefined;
}

function read<T, R>(accessor: Accessor<T, R>): (item: T) => unknown {
  return typeof accessor === 'function'
    ? accessor
    : (item: T) => (item as Record<string, unknown> | null)?.[accessor];
}

/**
 * Compiles a schema into plain functions once, so rendering and searching
 * never re-resolve property names per item.
 */
export function createAccessors<T>(
  schema?: Partial<ItemSchema<T>>
): ItemAccessors<T> {
  const s = { ...DEFAULT_SCHEMA, ...schema } as ItemSchema<T>;
  const label = read(s.label);
  const value = read(s.value);
  const disabled = read(s.disabled);
  const selectable = read(s.selectable);
  const testID = read(s.testID);

  return {
    label: (item) => {
      const v = label(item);
      return isNil(v) ? '' : String(v);
    },
    value: (item) => {
      const v = value(item);
      return typeof v === 'string' || typeof v === 'number' ? v : undefined;
    },
    disabled: (item) => disabled(item) === true,
    selectable: (item) => {
      const v = selectable(item);
      return typeof v === 'boolean' ? v : undefined;
    },
    testID: (item) => {
      const v = testID(item);
      return typeof v === 'string' ? v : undefined;
    },
  };
}
