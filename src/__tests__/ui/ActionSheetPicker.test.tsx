import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, useState } from 'react';
import type { KeyValueItem } from '../../core/types';
import { PickerProvider } from '../../theme/context';
import { ActionSheetPicker } from '../../ui/ActionSheetPicker';
import type {
  ActionSheetPickerHandle,
  ActionSheetPickerProps,
} from '../../ui/types';

const countries: KeyValueItem<string>[] = [
  { label: 'Kenya', value: 'KE' },
  { label: 'Uganda', value: 'UG' },
  { label: 'Tanzania', value: 'TZ' },
];
// No animations in tests: the sheet mounts/unmounts synchronously.
const instant = { motion: { durationIn: 0, durationOut: 0 } };

function Single(
  props: Partial<ActionSheetPickerProps<any, any>> & {
    initial?: any;
    spy?: (...args: any[]) => void;
  }
) {
  const { initial = null, spy, ...rest } = props;
  const [value, setValue] = useState<any>(initial);
  return (
    <ActionSheetPicker
      label="Country"
      items={countries}
      value={value}
      onChange={(v: any, item: any) => {
        spy?.(v, item);
        setValue(v);
      }}
      tokens={instant}
      testID="country"
      itemTestID="country-item"
      {...(rest as any)}
    />
  );
}

function Multi(
  props: Partial<ActionSheetPickerProps<any, any>> & {
    initial?: any[];
    spy?: (...args: any[]) => void;
  }
) {
  const { initial = [], spy, ...rest } = props;
  const [value, setValue] = useState<any[]>(initial);
  return (
    <ActionSheetPicker
      label="Countries"
      items={countries}
      multiple
      value={value}
      onChange={(v: any[], items: any[]) => {
        spy?.(v, items);
        setValue(v);
      }}
      tokens={instant}
      testID="countries"
      itemTestID="countries-item"
      {...(rest as any)}
    />
  );
}

const open = (id: string) => fireEvent.press(screen.getByTestId(id));

describe('trigger', () => {
  it('shows label, required marker and placeholder', async () => {
    await render(<Single required />);
    // Rendered as one Text: "Country" + nested " *"
    expect(screen.getByText('Country *')).toBeTruthy();
    expect(screen.getByText('Select an option')).toBeTruthy();
    expect(screen.queryByTestId('country-sheet')).toBeNull();
  });

  it('shows the error message', async () => {
    await render(<Single error="Country is required" />);
    expect(screen.getByText('Country is required')).toBeTruthy();
  });

  it('does not open when disabled', async () => {
    await render(<Single disabled />);
    await open('country');
    expect(screen.queryByTestId('country-sheet')).toBeNull();
  });
});

describe('single select', () => {
  it('opens, selects, closes and shows the selected label', async () => {
    const spy = jest.fn();
    await render(<Single spy={spy} />);
    await open('country');
    expect(screen.getByTestId('country-sheet')).toBeTruthy();
    expect(screen.getAllByTestId('country-item')).toHaveLength(3);

    await fireEvent.press(screen.getByText('Uganda'));
    expect(spy).toHaveBeenCalledWith('UG', countries[1]);
    expect(screen.queryByTestId('country-sheet')).toBeNull();
    expect(screen.getByText('Uganda')).toBeTruthy(); // trigger text
  });

  it('marks the selected row for accessibility', async () => {
    await render(<Single initial="TZ" />);
    await open('country');
    const rows = screen.getAllByTestId('country-item');
    expect(rows[2]?.props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('closes from the close button and the backdrop', async () => {
    await render(<Single />);
    await open('country');
    await fireEvent.press(screen.getByTestId('country-close'));
    expect(screen.queryByTestId('country-sheet')).toBeNull();
    await open('country');
    // The backdrop's animated opacity starts at 0 and Jest never runs the
    // native animation, so the query treats it as hidden.
    await fireEvent.press(
      screen.getByTestId('country-backdrop', { includeHiddenElements: true })
    );
    expect(screen.queryByTestId('country-sheet')).toBeNull();
  });

  it('opens via the ref handle', async () => {
    const ref = createRef<ActionSheetPickerHandle>();
    await render(
      <ActionSheetPicker
        ref={ref}
        items={countries}
        value={null}
        onChange={() => {}}
        tokens={instant}
        testID="country"
      />
    );
    await act(() => ref.current?.focus());
    expect(screen.getByTestId('country-sheet')).toBeTruthy();
  });
});

describe('search', () => {
  it('filters locally and offers to clear when nothing matches', async () => {
    await render(<Single searchable />);
    await open('country');
    await fireEvent.changeText(screen.getByTestId('country-search'), 'an');
    expect(screen.getAllByTestId('country-item')).toHaveLength(2);

    await fireEvent.changeText(screen.getByTestId('country-search'), 'zzz');
    expect(screen.getByText('Nothing to show')).toBeTruthy();
    await fireEvent.press(screen.getByText('Clear search'));
    expect(screen.getAllByTestId('country-item')).toHaveLength(3);
  });

  it('shows a spinner instead of "nothing to show" while loading', async () => {
    await render(<Single items={[]} loading />);
    await open('country');
    expect(screen.queryByText('Nothing to show')).toBeNull();
  });
});

describe('hierarchy', () => {
  it('renders parents as headers that cannot be picked', async () => {
    const spy = jest.fn();
    const items = [
      {
        label: 'Travel',
        value: 10,
        options: [{ label: 'Taxi', value: 11 }],
      },
    ];
    await render(
      <Single
        items={items}
        hierarchy={{ type: 'nested', childrenKey: 'options' }}
        spy={spy}
      />
    );
    await open('country');
    await fireEvent.press(screen.getByText('Travel'));
    expect(spy).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Taxi'));
    expect(spy).toHaveBeenCalledWith(11, items[0]?.options[0]);
  });
});

describe('multi select', () => {
  it('drafts picks and applies them with Done', async () => {
    const spy = jest.fn();
    await render(<Multi spy={spy} />);
    await open('countries');
    await fireEvent.press(screen.getByText('Kenya'));
    await fireEvent.press(screen.getByText('Tanzania'));
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByText('Done (2)')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('countries-done'));
    expect(spy).toHaveBeenCalledWith(
      ['KE', 'TZ'],
      [countries[0], countries[2]]
    );
    expect(screen.getByText('Kenya, Tanzania')).toBeTruthy();
  });

  it('shows a count when multipleDisplay is "count"', async () => {
    await render(<Multi initial={['KE', 'UG']} multipleDisplay="count" />);
    expect(screen.getByText('2 selected')).toBeTruthy();
  });

  it('removes a value from its chip', async () => {
    const spy = jest.fn();
    await render(
      <Multi initial={['KE', 'UG']} multipleDisplay="chips" spy={spy} />
    );
    await fireEvent.press(screen.getByLabelText('Remove Kenya'));
    expect(spy).toHaveBeenCalledWith(['UG'], [countries[1]]);
    expect(screen.queryByText('Kenya')).toBeNull();
  });

  it('clear all empties the draft only', async () => {
    const spy = jest.fn();
    await render(<Multi initial={['KE']} spy={spy} />);
    await open('countries');
    await fireEvent.press(screen.getByTestId('countries-clear'));
    expect(screen.getByText('Done')).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('customisation', () => {
  it('uses strings from props', async () => {
    await render(
      <Single
        searchable
        strings={{ placeholder: 'Chagua', searchPlaceholder: 'Tafuta' }}
      />
    );
    expect(screen.getByText('Chagua')).toBeTruthy();
    await open('country');
    expect(screen.getByPlaceholderText('Tafuta')).toBeTruthy();
  });

  it('takes defaults from PickerProvider, with props winning', async () => {
    await render(
      <PickerProvider strings={{ placeholder: 'Choisir', empty: 'Rien' }}>
        <Single items={[]} />
        <Single items={[]} testID="other" strings={{ placeholder: 'Pick' }} />
      </PickerProvider>
    );
    expect(screen.getByText('Choisir')).toBeTruthy();
    expect(screen.getByText('Pick')).toBeTruthy();
    await open('country');
    expect(screen.getByText('Rien')).toBeTruthy();
  });

  it('accepts a custom row renderer', async () => {
    const { Text } =
      jest.requireActual<typeof import('react-native')>('react-native');
    await render(
      <Single
        renderItem={({ row, selected }) => (
          <Text>{`${row.label}${selected ? ' ✓' : ''}`}</Text>
        )}
        initial="KE"
      />
    );
    await open('country');
    expect(screen.getByText('Kenya ✓')).toBeTruthy();
  });
});

describe('animated close (default motion)', () => {
  it('keeps the sheet mounted until the close animation ends', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    await render(
      <Single
        tokens={{ motion: { durationIn: 10, durationOut: 200 } }}
        onDismiss={onDismiss}
      />
    );
    await open('country');
    await fireEvent.press(screen.getByTestId('country-close'));
    expect(screen.getByTestId('country-sheet')).toBeTruthy();
    expect(onDismiss).not.toHaveBeenCalled();
    await act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByTestId('country-sheet')).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
