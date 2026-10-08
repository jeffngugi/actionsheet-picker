import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type TextStyle,
} from 'react-native';
import type { Row as RowData } from '../core/types';
import type { PickerState } from '../hook/types';
import type { BaseStyles } from '../theme/createStyles';
import type { PickerStrings } from '../theme/strings';
import type { PickerTokens } from '../theme/tokens';
import { ChevronIcon, CloseIcon } from './Icons';
import type { PickerIcons, PickerStyles } from './types';

interface Props<T> {
  picker: PickerState<T>;
  text: string;
  placeholder: string;
  label?: string;
  hasError: boolean;
  loading: boolean;
  chips: boolean;
  base: BaseStyles;
  styles: Partial<PickerStyles>;
  strings: PickerStrings;
  tokens: PickerTokens;
  icons: Partial<PickerIcons>;
  testID?: string;
}

/** The form field that opens the sheet. */
export function Trigger<T>({
  picker,
  text,
  placeholder,
  label,
  hasError,
  loading,
  chips,
  base,
  styles,
  strings,
  tokens,
  icons,
  testID,
}: Props<T>) {
  const { disabled } = picker;
  const showChips = chips && picker.selectedRows.length > 0;

  return (
    <Pressable
      testID={testID}
      onPress={picker.open}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={placeholder}
      accessibilityValue={text ? { text } : undefined}
      accessibilityState={{ disabled, expanded: picker.isOpen }}
      style={[
        base.trigger,
        styles.trigger,
        hasError && base.triggerError,
        hasError && styles.triggerError,
        disabled && base.triggerDisabled,
        disabled && styles.triggerDisabled,
      ]}
    >
      <View style={base.triggerBody}>
        {showChips ? (
          <View style={base.chips}>
            {picker.selectedRows.map((row) => (
              <Chip
                key={row.valueKey}
                row={row}
                onRemove={disabled ? undefined : picker.removeValue}
                base={base}
                styles={styles}
                strings={strings}
                tokens={tokens}
              />
            ))}
          </View>
        ) : (
          <Text
            numberOfLines={1}
            style={
              (text
                ? [base.triggerText, styles.triggerText]
                : [base.placeholder, styles.placeholder]) as TextStyle[]
            }
          >
            {text || placeholder}
          </Text>
        )}
      </View>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={tokens.colors.textMuted}
          style={base.triggerAccessory}
        />
      ) : null}
      {!disabled ? (
        <View style={base.triggerAccessory}>
          {icons.chevron ?? (
            <ChevronIcon
              color={tokens.colors.placeholder}
              size={tokens.sizes.iconSize}
            />
          )}
        </View>
      ) : null}
    </Pressable>
  );
}

function Chip<T>({
  row,
  onRemove,
  base,
  styles,
  strings,
  tokens,
}: {
  row: RowData<T>;
  onRemove?: (value: RowData<T>['value']) => void;
  base: BaseStyles;
  styles: Partial<PickerStyles>;
  strings: PickerStrings;
  tokens: PickerTokens;
}) {
  return (
    <View style={[base.chip, styles.chip]}>
      <Text style={[base.chipText, styles.chipText]} numberOfLines={1}>
        {row.label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={() => onRemove(row.value)}
          hitSlop={8}
          style={base.chipRemove}
          accessibilityRole="button"
          accessibilityLabel={strings.remove(row.label)}
        >
          <CloseIcon color={tokens.colors.textMuted} size={10} />
        </Pressable>
      ) : null}
    </View>
  );
}
