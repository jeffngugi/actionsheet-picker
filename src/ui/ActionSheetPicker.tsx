import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  type ReactElement,
  type Ref,
} from 'react';
import { Text, View } from 'react-native';
import type { KeyValueItem, Row, ValueType } from '../core/types';
import { useActionSheetPicker } from '../hook/useActionSheetPicker';
import { useResolvedTheme } from '../theme/context';
import { createStyles } from '../theme/createStyles';
import type { PickerStrings } from '../theme/strings';
import { ModalSheet } from '../sheet/ModalSheet';
import { SheetContent } from './SheetContent';
import { Trigger } from './Trigger';
import { useAutoInsets } from './useAutoInsets';
import type {
  ActionSheetPickerHandle,
  ActionSheetPickerProps,
  MultiActionSheetPickerProps,
  PickerUIProps,
  SingleActionSheetPickerProps,
} from './types';

const MAX_TRIGGER_LABELS = 3;

function triggerText<T>(
  rows: Row<T>[],
  multiple: boolean,
  ui: PickerUIProps<T>,
  strings: PickerStrings
): string {
  if (!rows.length) return '';
  if (ui.formatSelected) return ui.formatSelected(rows);
  if (!multiple) return rows[0]?.label ?? '';
  if (ui.multipleDisplay === 'count') return strings.selectedCount(rows.length);
  const shown = rows.slice(0, MAX_TRIGGER_LABELS).map((r) => r.label);
  const rest = rows.length - shown.length;
  return rest > 0
    ? `${shown.join(', ')} ${strings.more(rest)}`
    : shown.join(', ');
}

function ActionSheetPickerInner<T, V extends ValueType>(
  props: ActionSheetPickerProps<T, V>,
  ref: Ref<ActionSheetPickerHandle>
) {
  const picker = useActionSheetPicker<T, V>(props);
  const theme = useResolvedTheme(props);
  const { tokens, strings, styles } = theme;
  const base = useMemo(() => createStyles(tokens), [tokens]);
  // Measured outside the Modal, where the app's SafeAreaProvider is.
  const insets = useAutoInsets();

  useImperativeHandle(
    ref,
    () => ({
      open: picker.open,
      close: picker.close,
      focus: picker.open,
      clear: picker.clear,
    }),
    [picker.open, picker.close, picker.clear]
  );

  const {
    label,
    required,
    error,
    invalid,
    loading = false,
    testID,
    renderTrigger,
  } = props;
  const placeholder = props.placeholder ?? strings.placeholder;
  const text = triggerText(
    picker.selectedRows,
    picker.isMultiple,
    props,
    strings
  );
  const hasError = Boolean(error) || invalid === true;
  const Sheet = theme.Sheet ?? ModalSheet;
  const presentation = props.presentation ?? 'sheet';

  return (
    <View style={[base.container, styles.container]}>
      {label ? (
        <Text style={[base.label, styles.label]}>
          {label}
          {required ? (
            <Text style={[base.requiredMark, styles.requiredMark]}> *</Text>
          ) : null}
        </Text>
      ) : null}

      {renderTrigger ? (
        renderTrigger({
          picker,
          text,
          placeholder,
          error,
          disabled: picker.disabled,
          loading,
        })
      ) : (
        <Trigger
          picker={picker}
          text={text}
          placeholder={placeholder}
          label={label}
          hasError={hasError}
          loading={loading}
          chips={picker.isMultiple && props.multipleDisplay === 'chips'}
          base={base}
          styles={styles}
          strings={strings}
          tokens={tokens}
          icons={theme.icons}
          testID={testID}
        />
      )}

      {error ? <Text style={[base.error, styles.error]}>{error}</Text> : null}

      <Sheet
        visible={picker.isOpen}
        onRequestClose={picker.close}
        onDismissed={props.onDismiss}
        tokens={tokens}
        styles={styles}
        fixedHeight={picker.searchable && presentation === 'sheet'}
        bottomInset={props.bottomInset ?? insets.bottom}
        topInset={props.topInset ?? (insets.top || undefined)}
        presentation={presentation}
        modalProps={props.modalProps}
        closeOnBackdropPress={props.closeOnBackdropPress ?? true}
        swipeToClose={props.swipeToClose ?? true}
        testID={testID}
      >
        <SheetContent
          picker={picker}
          ui={props}
          theme={theme}
          base={base}
          title={props.title ?? label ?? strings.title}
          loading={loading}
          loadingMore={props.pagination?.loadingMore ?? false}
          fill={picker.searchable || presentation === 'fullscreen'}
          testID={testID}
        />
      </Sheet>
    </View>
  );
}

/**
 * A form field that opens a bottom sheet to pick one value (default) or
 * several (`multiple`). Controlled: pass `value` and `onChange`.
 */
type WithRef = { ref?: Ref<ActionSheetPickerHandle> };

interface ActionSheetPickerComponent {
  // One signature per mode so `V` is inferred from `value`.
  <T = KeyValueItem, V extends ValueType = ValueType>(
    props: SingleActionSheetPickerProps<T, V> & WithRef
  ): ReactElement;
  <T = KeyValueItem, V extends ValueType = ValueType>(
    props: MultiActionSheetPickerProps<T, V> & WithRef
  ): ReactElement;
  /** For wrappers that forward already-typed props of either mode. */
  <T = KeyValueItem, V extends ValueType = ValueType>(
    props: ActionSheetPickerProps<T, V> & WithRef
  ): ReactElement;
}

export const ActionSheetPicker = forwardRef(
  ActionSheetPickerInner
) as unknown as ActionSheetPickerComponent;
