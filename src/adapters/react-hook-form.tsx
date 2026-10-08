import type { ReactElement } from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
  type RegisterOptions,
} from 'react-hook-form';
import type { KeyValueItem, ValueType } from '../core/types';
import { ActionSheetPicker } from '../ui/ActionSheetPicker';
import type {
  ActionSheetPickerProps,
  MultiActionSheetPickerProps,
  SingleActionSheetPickerProps,
} from '../ui/types';

/**
 * react-hook-form binding. Import from `actionsheet-picker/react-hook-form`;
 * the main entry never imports react-hook-form, so it stays optional.
 */

type ControlledKeys = 'value' | 'onChange' | 'onBlur' | 'error';

interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  /** Prefer `useForm({ defaultValues })`; this is for fields added later. */
  defaultValue?: PathValue<TFieldValues, TName>;
  shouldUnregister?: boolean;
}

export type RHFSingleProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  T = KeyValueItem,
  V extends ValueType = ValueType,
> = FormFieldProps<TFieldValues, TName> &
  Omit<SingleActionSheetPickerProps<T, V>, ControlledKeys> & {
    /** Called after the form value is updated (e.g. for side effects). */
    onChange?: (value: V | null, item: T | null) => void;
  };

export type RHFMultiProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  T = KeyValueItem,
  V extends ValueType = ValueType,
> = FormFieldProps<TFieldValues, TName> &
  Omit<MultiActionSheetPickerProps<T, V>, ControlledKeys> & {
    /** Called after the form value is updated (e.g. for side effects). */
    onChange?: (values: V[], items: T[]) => void;
  };

function RHFActionSheetPickerImpl(
  props: RHFSingleProps<any, any, any, any> | RHFMultiProps<any, any, any, any>
): ReactElement {
  const {
    control,
    name,
    rules,
    defaultValue,
    shouldUnregister,
    onChange: onChangeProp,
    required,
    disabled,
    ...pickerProps
  } = props;

  const { field, fieldState } = useController({
    control,
    name,
    rules,
    defaultValue,
    shouldUnregister,
  });

  const multiple = props.multiple === true;
  const empty = multiple ? [] : null;

  const common = {
    ...pickerProps,
    ref: field.ref,
    disabled: disabled ?? field.disabled,
    required: required ?? Boolean(rules?.required),
    error: fieldState.error?.message,
    invalid: fieldState.invalid,
    onBlur: field.onBlur,
    value: field.value ?? empty,
    onChange: (next: any, items: any) => {
      field.onChange(next);
      (onChangeProp as ((a: any, b: any) => void) | undefined)?.(next, items);
    },
  };

  return (
    <ActionSheetPicker {...(common as ActionSheetPickerProps<any, any>)} />
  );
}

interface RHFActionSheetPickerComponent {
  // One signature per mode so values/items are typed like the picker's.
  <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
    T = KeyValueItem,
    V extends ValueType = ValueType,
  >(
    props: RHFSingleProps<TFieldValues, TName, T, V>
  ): ReactElement;
  <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
    T = KeyValueItem,
    V extends ValueType = ValueType,
  >(
    props: RHFMultiProps<TFieldValues, TName, T, V>
  ): ReactElement;
}

/**
 * `ActionSheetPicker` bound to a react-hook-form field: value, change,
 * touched (on close), validation error and `setFocus` (opens the sheet).
 */
export const RHFActionSheetPicker =
  RHFActionSheetPickerImpl as RHFActionSheetPickerComponent;
