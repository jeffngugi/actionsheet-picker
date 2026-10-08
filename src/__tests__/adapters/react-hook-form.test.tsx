import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { RHFActionSheetPicker } from '../../adapters/react-hook-form';

const countries = [
  { label: 'Kenya', value: 'KE' },
  { label: 'Uganda', value: 'UG' },
  { label: 'Tanzania', value: 'TZ' },
];
const instant = { motion: { durationIn: 0, durationOut: 0 } };

type Values = { country: string | null; tags: string[] };

function Form({
  defaultValues = { country: null, tags: [] },
  onSubmit = () => {},
  onCountryChange,
  expose,
}: {
  defaultValues?: Values;
  onSubmit?: (v: Values) => void;
  onCountryChange?: (v: string | null, item: unknown) => void;
  expose?: (form: UseFormReturn<Values>) => void;
}) {
  const form = useForm<Values>({ defaultValues });
  useEffect(() => {
    expose?.(form);
  });
  return (
    <>
      <RHFActionSheetPicker
        control={form.control}
        name="country"
        rules={{ required: 'Country is required' }}
        label="Country"
        items={countries}
        tokens={instant}
        testID="country"
        onChange={onCountryChange}
      />
      <RHFActionSheetPicker
        control={form.control}
        name="tags"
        multiple
        label="Tags"
        items={countries}
        tokens={instant}
        testID="tags"
      />
      <Pressable testID="submit" onPress={() => form.handleSubmit(onSubmit)()}>
        <Text>Submit</Text>
      </Pressable>
    </>
  );
}

describe('RHFActionSheetPicker', () => {
  it('shows the required marker from rules', async () => {
    await render(<Form />);
    expect(screen.getByText('Country *')).toBeTruthy();
    expect(screen.getByText('Tags')).toBeTruthy(); // no rules → no marker
  });

  it('blocks submit with the rule message, then submits the picked value', async () => {
    const onSubmit = jest.fn();
    await render(<Form onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByTestId('submit'));
    expect(await screen.findByText('Country is required')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();

    // shouldFocusError → setFocus → the picker opened its sheet
    expect(screen.getByTestId('country-sheet')).toBeTruthy();
    await fireEvent.press(screen.getByText('Uganda'));
    expect(screen.queryByText('Country is required')).toBeNull();

    await fireEvent.press(screen.getByTestId('submit'));
    await act(async () => {});
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ country: 'UG', tags: [] });
  });

  it('shows the label for a value from defaultValues', async () => {
    await render(<Form defaultValues={{ country: 'TZ', tags: ['KE'] }} />);
    expect(screen.getByText('Tanzania')).toBeTruthy();
    expect(screen.getByText('Kenya')).toBeTruthy();
  });

  it('marks the field touched when the sheet closes', async () => {
    let form!: UseFormReturn<Values>;
    await render(<Form expose={(f) => (form = f)} />);
    expect(form.getFieldState('country').isTouched).toBe(false);
    await fireEvent.press(screen.getByTestId('country'));
    await fireEvent.press(screen.getByTestId('country-close'));
    expect(form.getFieldState('country').isTouched).toBe(true);
  });

  it('calls the extra onChange after updating the form', async () => {
    let form!: UseFormReturn<Values>;
    const onCountryChange = jest.fn((v: string | null) => {
      // the form already holds the new value
      expect(form.getValues('country')).toBe(v);
    });
    await render(
      <Form expose={(f) => (form = f)} onCountryChange={onCountryChange} />
    );
    await fireEvent.press(screen.getByTestId('country'));
    await fireEvent.press(screen.getByText('Kenya'));
    expect(onCountryChange).toHaveBeenCalledWith('KE', countries[0]);
  });

  it('binds multi-select values', async () => {
    let form!: UseFormReturn<Values>;
    await render(<Form expose={(f) => (form = f)} />);
    await fireEvent.press(screen.getByTestId('tags'));
    await fireEvent.press(screen.getByText('Kenya'));
    await fireEvent.press(screen.getByText('Tanzania'));
    await fireEvent.press(screen.getByTestId('tags-done'));
    expect(form.getValues('tags')).toEqual(['KE', 'TZ']);
    expect(screen.getByText('Kenya, Tanzania')).toBeTruthy();
  });

  it('follows reset() and setValue()', async () => {
    let form!: UseFormReturn<Values>;
    await render(
      <Form
        defaultValues={{ country: 'KE', tags: [] }}
        expose={(f) => (form = f)}
      />
    );
    await act(() => form.setValue('country', 'UG'));
    expect(screen.getByText('Uganda')).toBeTruthy();
    expect(screen.getByTestId('country').props.accessibilityValue).toEqual({
      text: 'Uganda',
    });
    await act(() => form.reset({ country: null, tags: [] }));
    expect(screen.queryByText('Uganda')).toBeNull();
    // Cleared explicitly (not `undefined`), or Android keeps announcing it.
    expect(
      screen.getByTestId('country').props.accessibilityValue
    ).toMatchObject({
      text: 'Select an option',
    });
    expect(screen.getAllByText('Select an option').length).toBeGreaterThan(0);
  });
});
