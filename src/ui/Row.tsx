import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Row as RowData } from '../core/types';
import type { PickerTokens } from '../theme/tokens';
import type { BaseStyles } from '../theme/createStyles';
import { CheckIcon } from './Icons';
import type { PickerIcons, PickerStyles } from './types';

export interface RowProps<T> {
  row: RowData<T>;
  selected: boolean;
  multiple: boolean;
  fixedHeight: boolean;
  onSelect: (row: RowData<T>) => void;
  base: BaseStyles;
  styles: Partial<PickerStyles>;
  tokens: PickerTokens;
  icons: Partial<PickerIcons>;
  testID?: string;
}

function RowView<T>({
  row,
  selected,
  multiple,
  fixedHeight,
  onSelect,
  base,
  styles,
  tokens,
  icons,
  testID,
}: RowProps<T>) {
  const onPress = useCallback(() => onSelect(row), [onSelect, row]);
  const isHeader = row.isParent && !row.selectable && !row.disabled;
  const isChild = row.depth === 1;

  const textStyle = [
    base.rowText,
    styles.rowText,
    isHeader && base.parentText,
    isHeader && styles.parentText,
    isChild && base.childText,
    selected && base.rowTextSelected,
    selected && styles.rowTextSelected,
    row.disabled && base.rowTextDisabled,
    row.disabled && styles.rowTextDisabled,
  ];

  let accessory = null;
  if (multiple && row.selectable) {
    accessory = (
      <View
        style={[
          base.checkbox,
          styles.checkbox,
          selected && base.checkboxChecked,
          selected && styles.checkboxChecked,
        ]}
      >
        {selected ? (
          <CheckIcon
            color={tokens.colors.onAccent}
            size={tokens.sizes.checkboxSize - 6}
          />
        ) : null}
      </View>
    );
  } else if (multiple && row.disabled) {
    accessory = <View style={[base.checkbox, base.checkboxDisabled]} />;
  } else if (selected) {
    accessory = icons.check ?? (
      <CheckIcon color={tokens.colors.accent} size={tokens.sizes.iconSize} />
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={row.selectable ? onPress : undefined}
      disabled={!row.selectable}
      accessibilityRole={isHeader ? 'header' : multiple ? 'checkbox' : 'button'}
      accessibilityState={
        isHeader
          ? undefined
          : {
              disabled: !row.selectable,
              ...(multiple ? { checked: selected } : { selected }),
            }
      }
      style={({ pressed }) => [
        base.row,
        !fixedHeight && base.rowAuto,
        isChild && base.childRow,
        isChild && !fixedHeight && base.childRowAuto,
        styles.row,
        isHeader && styles.parentRow,
        isChild && styles.childRow,
        selected && base.rowSelected,
        selected && styles.rowSelected,
        row.disabled && styles.rowDisabled,
        pressed && row.selectable && base.rowPressed,
      ]}
    >
      <Text style={textStyle} numberOfLines={fixedHeight ? 1 : undefined}>
        {row.label}
      </Text>
      {accessory ? <View style={base.rowAccessory}>{accessory}</View> : null}
    </Pressable>
  );
}

/** Re-renders only when this row's own data or selection changes. */
export const Row = memo(
  RowView,
  (prev, next) =>
    prev.row === next.row &&
    prev.selected === next.selected &&
    prev.multiple === next.multiple &&
    prev.fixedHeight === next.fixedHeight &&
    prev.onSelect === next.onSelect &&
    prev.base === next.base &&
    prev.styles === next.styles &&
    prev.icons === next.icons &&
    prev.testID === next.testID
) as typeof RowView;
