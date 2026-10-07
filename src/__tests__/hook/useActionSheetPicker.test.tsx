import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { StrictMode, useRef, useState } from 'react';
import type { KeyValueItem } from '../../core/types';
import { useActionSheetPicker } from '../../hook/useActionSheetPicker';
import type { MultiPickerOptions, SinglePickerOptions } from '../../hook/types';

type Item = KeyValueItem<string>;
const countries: Item[] = [
  { label: 'Kenya', value: 'KE' },
  { label: 'Uganda', value: 'UG' },
  { label: 'Tanzania', value: 'TZ' },
  { label: 'Rwanda', value: 'RW', disabled: true },
];
const rowOf = (state: { allRows: { valueKey: string }[] }, key: string) =>
  state.allRows.find((r) => r.valueKey === key) as any;

/** Single-select harness: value lives in parent state like a real form. */
function useSingle(
  overrides: Partial<SinglePickerOptions<any, any>> = {},
  initial: any = null
) {
  const [value, setValue] = useState<any>(initial);
  const onChange = useRef(jest.fn((v: any) => setValue(v))).current;
  const picker = useActionSheetPicker<any, any>({
    items: countries,
    value,
    onChange,
    ...overrides,
  } as SinglePickerOptions<any, any>);
  return { picker, value, onChange };
}

function useMulti(
  overrides: Partial<MultiPickerOptions<any, any>> = {},
  initial: any[] = []
) {
  const [value, setValue] = useState<any[]>(initial);
  const onChange = useRef(jest.fn((v: any[]) => setValue(v))).current;
  const picker = useActionSheetPicker<any, any>({
    items: countries,
    multiple: true,
    value,
    onChange,
    ...overrides,
  } as MultiPickerOptions<any, any>);
  return { picker, value, onChange };
}

describe('open state', () => {
  it('is closed by default and opens/closes/toggles', async () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const onBlur = jest.fn();
    const { result } = await renderHook(() =>
      useSingle({ onOpen, onClose, onBlur })
    );
    expect(result.current.picker.isOpen).toBe(false);

    await act(() => result.current.picker.open());
    expect(result.current.picker.isOpen).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);

    await act(() => result.current.picker.toggle());
    expect(result.current.picker.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('does not open while disabled, and closes if disabled while open', async () => {
    const { result, rerender } = await renderHook(
      ({ disabled }: { disabled: boolean }) => useSingle({ disabled }),
      { initialProps: { disabled: true } }
    );
    await act(() => result.current.picker.open());
    expect(result.current.picker.isOpen).toBe(false);

    await rerender({ disabled: false });
    await act(() => result.current.picker.open());
    expect(result.current.picker.isOpen).toBe(true);
    await rerender({ disabled: true });
    expect(result.current.picker.isOpen).toBe(false);
  });

  it('supports controlled open via open/onOpenChange', async () => {
    const onOpenChange = jest.fn();
    const { result, rerender } = await renderHook(
      ({ open }: { open: boolean }) => useSingle({ open, onOpenChange }),
      { initialProps: { open: false } }
    );
    await act(() => result.current.picker.open());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.picker.isOpen).toBe(false); // parent hasn't agreed yet
    await rerender({ open: true });
    expect(result.current.picker.isOpen).toBe(true);
  });
});

describe('single select (default)', () => {
  it('selects, reports the item, and closes', async () => {
    const { result } = await renderHook(() => useSingle());
    await act(() => result.current.picker.open());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'UG'))
    );
    expect(result.current.onChange).toHaveBeenCalledWith('UG', countries[1]);
    expect(result.current.value).toBe('UG');
    expect(result.current.picker.isOpen).toBe(false);
    expect(result.current.picker.selectedRows.map((r) => r.label)).toEqual([
      'Uganda',
    ]);
  });

  it('ignores disabled rows', async () => {
    const { result } = await renderHook(() => useSingle());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'RW'))
    );
    expect(result.current.onChange).not.toHaveBeenCalled();
  });

  it('does not re-fire onChange when re-picking, unless allowDeselect', async () => {
    const { result } = await renderHook(() => useSingle({}, 'KE'));
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'KE'))
    );
    expect(result.current.onChange).not.toHaveBeenCalled();

    const deselect = await renderHook(() =>
      useSingle({ allowDeselect: true }, 'KE')
    );
    await act(() =>
      deselect.result.current.picker.selectRow(
        rowOf(deselect.result.current.picker, 'KE')
      )
    );
    expect(deselect.result.current.onChange).toHaveBeenCalledWith(null, null);
  });

  it('can stay open with closeOnSelect: false', async () => {
    const { result } = await renderHook(() =>
      useSingle({ closeOnSelect: false })
    );
    await act(() => result.current.picker.open());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'KE'))
    );
    expect(result.current.picker.isOpen).toBe(true);
  });

  it('matches numeric values to string items', async () => {
    const { result } = await renderHook(() =>
      useSingle({ items: [{ label: 'One', value: '1' }] }, 1)
    );
    expect(result.current.picker.isSelected('1')).toBe(true);
    expect(result.current.picker.selectedRows[0]?.label).toBe('One');
  });

  it('never fires onChange for external value changes', async () => {
    const onChange = jest.fn();
    const { rerender } = await renderHook(
      ({ value }: { value: string | null }) =>
        useActionSheetPicker({ items: countries, value, onChange }),
      { initialProps: { value: null as string | null } }
    );
    await rerender({ value: 'KE' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clear() resets the value', async () => {
    const { result } = await renderHook(() => useSingle({}, 'KE'));
    await act(() => result.current.picker.clear());
    expect(result.current.onChange).toHaveBeenCalledWith(null, null);
  });
});

describe('selected label cache', () => {
  it('keeps the label after the selected item leaves `items`', async () => {
    const { result, rerender } = await renderHook(
      ({ items }: { items: Item[] }) => useSingle({ items }, 'KE'),
      { initialProps: { items: countries } }
    );
    await rerender({ items: [{ label: 'Burundi', value: 'BI' }] });
    expect(result.current.picker.selectedRows[0]?.label).toBe('Kenya');
  });

  it('uses selectedItems for a saved value not loaded yet', async () => {
    const { result } = await renderHook(() =>
      useSingle(
        { items: [], selectedItems: [{ label: 'Saved', value: 'S1' }] },
        'S1'
      )
    );
    expect(result.current.picker.selectedRows[0]?.label).toBe('Saved');
    expect(result.current.picker.hasValue).toBe(true);
  });
});

describe('multi select (opt-in)', () => {
  it('drafts picks until commit, then reports values and items', async () => {
    const { result } = await renderHook(() => useMulti());
    await act(() => result.current.picker.open());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'KE'))
    );
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'TZ'))
    );
    expect(result.current.onChange).not.toHaveBeenCalled();
    expect(result.current.picker.isSelected('TZ')).toBe(true);
    expect(result.current.picker.isDirty).toBe(true);
    expect(result.current.picker.draftCount).toBe(2);

    await act(() => result.current.picker.commit());
    expect(result.current.onChange).toHaveBeenCalledWith(
      ['KE', 'TZ'],
      [countries[0], countries[2]]
    );
    expect(result.current.picker.isOpen).toBe(false);
  });

  it('discards the draft when closed without commit', async () => {
    const { result } = await renderHook(() => useMulti({}, ['KE']));
    await act(() => result.current.picker.open());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'UG'))
    );
    await act(() => result.current.picker.close());
    expect(result.current.onChange).not.toHaveBeenCalled();
    // reopening starts from the committed value again
    await act(() => result.current.picker.open());
    expect(result.current.picker.isSelected('UG')).toBe(false);
    expect(result.current.picker.isSelected('KE')).toBe(true);
  });

  it('commit without changes does not call onChange', async () => {
    const { result } = await renderHook(() => useMulti({}, ['KE']));
    await act(() => result.current.picker.open());
    await act(() => result.current.picker.commit());
    expect(result.current.onChange).not.toHaveBeenCalled();
  });

  it('instant mode calls onChange on every tap', async () => {
    const { result } = await renderHook(() =>
      useMulti({ confirmMode: 'instant' })
    );
    await act(() => result.current.picker.open());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'KE'))
    );
    expect(result.current.onChange).toHaveBeenLastCalledWith(
      ['KE'],
      [countries[0]]
    );
    expect(result.current.picker.isOpen).toBe(true);
  });

  it('enforces max and reports it', async () => {
    const onLimitReached = jest.fn();
    const { result } = await renderHook(() =>
      useMulti({ max: 1, onLimitReached })
    );
    await act(() => result.current.picker.open());
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'KE'))
    );
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'UG'))
    );
    expect(onLimitReached).toHaveBeenCalledWith('max');
    expect(result.current.picker.draftCount).toBe(1);
  });

  it('removeValue removes a committed chip, honouring min', async () => {
    const { result } = await renderHook(() => useMulti({}, ['KE', 'UG']));
    await act(() => result.current.picker.removeValue('KE'));
    expect(result.current.onChange).toHaveBeenLastCalledWith(
      ['UG'],
      [countries[1]]
    );

    const onLimitReached = jest.fn();
    const limited = await renderHook(() =>
      useMulti({ min: 1, onLimitReached }, ['KE'])
    );
    await act(() => limited.result.current.picker.removeValue('KE'));
    expect(onLimitReached).toHaveBeenCalledWith('min');
    expect(limited.result.current.onChange).not.toHaveBeenCalled();
  });

  it('clear() empties the draft while open, the value while closed', async () => {
    const { result } = await renderHook(() => useMulti({}, ['KE']));
    await act(() => result.current.picker.open());
    await act(() => result.current.picker.clear());
    expect(result.current.picker.draftCount).toBe(0);
    expect(result.current.onChange).not.toHaveBeenCalled();
    await act(() => result.current.picker.close());
    await act(() => result.current.picker.clear());
    expect(result.current.onChange).toHaveBeenCalledWith([], []);
  });
});

describe('local search', () => {
  it('filters rows and clears the query on close', async () => {
    const { result } = await renderHook(() => useSingle({ searchable: true }));
    await act(() => result.current.picker.open());
    await act(() => result.current.picker.setQuery('an'));
    expect(result.current.picker.rows.map((r) => r.label)).toEqual([
      'Uganda',
      'Tanzania',
      'Rwanda',
    ]);
    await act(() => result.current.picker.close());
    expect(result.current.picker.query).toBe('');
    expect(result.current.picker.rows).toHaveLength(4);
  });

  it('does not filter when search is off', async () => {
    const { result } = await renderHook(() => useSingle());
    await act(() => result.current.picker.setQuery('zzz'));
    expect(result.current.picker.rows).toHaveLength(4);
  });

  it('works with hierarchy: child matches keep their parent', async () => {
    const items = [
      {
        label: 'Travel',
        value: 10,
        subCategoryOptions: [
          { label: 'Taxi', value: 11 },
          { label: 'Flights', value: 12 },
        ],
      },
      { label: 'Meals', value: 20 },
    ];
    const { result } = await renderHook(() =>
      useSingle({
        items,
        searchable: true,
        hierarchy: { type: 'nested', childrenKey: 'subCategoryOptions' },
      })
    );
    await act(() => result.current.picker.setQuery('fli'));
    expect(result.current.picker.rows.map((r) => r.label)).toEqual([
      'Travel',
      'Flights',
    ]);
    const travel = rowOf(result.current.picker, '10');
    await act(() => result.current.picker.selectRow(travel));
    expect(result.current.onChange).not.toHaveBeenCalled(); // parent not selectable
  });
});

describe('remote search', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces onChangeText and never filters items locally', async () => {
    const onChangeText = jest.fn();
    const { result } = await renderHook(() =>
      useSingle({ searchable: { mode: 'remote', onChangeText } })
    );
    await act(() => result.current.picker.open());
    await act(() => result.current.picker.setQuery('j'));
    await act(() => result.current.picker.setQuery('jo'));
    expect(onChangeText).not.toHaveBeenCalled();
    expect(result.current.picker.query).toBe('jo'); // typing is never clobbered
    expect(result.current.picker.rows).toHaveLength(4);

    await act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('jo');
  });

  it('keeps the debounce across re-renders with an inline callback', async () => {
    const calls: string[] = [];
    const { result } = await renderHook(() =>
      useSingle({
        searchable: { mode: 'remote', onChangeText: (t) => calls.push(t) },
      })
    );
    await act(() => result.current.picker.setQuery('jo'));
    await act(() => {
      jest.advanceTimersByTime(200);
    });
    await act(() => result.current.picker.open()); // unrelated re-render
    await act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(calls).toEqual(['jo']);
  });

  it('resets the remote filter on close and cancels pending text', async () => {
    const onChangeText = jest.fn();
    const { result } = await renderHook(() =>
      useSingle({ searchable: { mode: 'remote', onChangeText } })
    );
    await act(() => result.current.picker.open());
    await act(() => result.current.picker.setQuery('jo'));
    await act(() => {
      jest.advanceTimersByTime(300);
    });
    await act(() => result.current.picker.setQuery('joh')); // pending
    await act(() => result.current.picker.close());
    await act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onChangeText.mock.calls.map((c) => c[0])).toEqual(['jo', '']);
  });
});

describe('pagination', () => {
  it('calls onEndReached once until the page lands', async () => {
    const onEndReached = jest.fn();
    const { result, rerender } = await renderHook(
      ({ loadingMore, items }: { loadingMore: boolean; items: Item[] }) =>
        useSingle({
          items,
          pagination: { hasMore: true, loadingMore, onEndReached },
        }),
      { initialProps: { loadingMore: false, items: countries.slice(0, 2) } }
    );
    await act(() => result.current.picker.onEndReached());
    await act(() => result.current.picker.onEndReached());
    expect(onEndReached).toHaveBeenCalledTimes(1);

    await rerender({ loadingMore: true, items: countries.slice(0, 2) });
    await act(() => result.current.picker.onEndReached());
    expect(onEndReached).toHaveBeenCalledTimes(1);

    await rerender({ loadingMore: false, items: countries });
    await act(() => result.current.picker.onEndReached());
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it('a new scroll gesture unlocks the request', async () => {
    const onEndReached = jest.fn();
    const { result } = await renderHook(() =>
      useSingle({
        pagination: { hasMore: true, loadingMore: false, onEndReached },
      })
    );
    await act(() => result.current.picker.onEndReached());
    await act(() => result.current.picker.onMomentumScrollBegin());
    await act(() => result.current.picker.onEndReached());
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it('does nothing when there are no more pages', async () => {
    const onEndReached = jest.fn();
    const { result } = await renderHook(() =>
      useSingle({
        pagination: { hasMore: false, loadingMore: false, onEndReached },
      })
    );
    await act(() => result.current.picker.onEndReached());
    expect(onEndReached).not.toHaveBeenCalled();
  });
});

describe('render stability', () => {
  it('does not rebuild rows for inline schema/items that are shallowly equal', async () => {
    const raw = [{ id: 1, name: 'A' }];
    const { result, rerender } = await renderHook(
      (props: { n: number }) =>
        useSingle({
          items: [...raw], // new array, same elements
          schema: { value: 'id', label: 'name' }, // new object, same keys
          ...(props.n ? {} : {}),
        }),
      { initialProps: { n: 0 } }
    );
    const first = result.current.picker.allRows;
    await rerender({ n: 1 });
    expect(result.current.picker.allRows).toBe(first);
  });
});

describe('StrictMode', () => {
  it('behaves the same under double render/effects', async () => {
    const onOpen = jest.fn();
    const { result } = await renderHook(() => useMulti({ onOpen }, ['KE']), {
      wrapper: StrictMode,
    });
    await act(() => result.current.picker.open());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(result.current.picker.isSelected('KE')).toBe(true);
    await act(() =>
      result.current.picker.selectRow(rowOf(result.current.picker, 'UG'))
    );
    await act(() => result.current.picker.commit());
    expect(result.current.onChange).toHaveBeenCalledTimes(1);
    expect(result.current.value).toEqual(['KE', 'UG']);
    expect(result.current.picker.selectedRows.map((r) => r.label)).toEqual([
      'Kenya',
      'Uganda',
    ]);
  });
});
