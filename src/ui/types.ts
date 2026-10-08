import type { ComponentType, ReactElement, ReactNode } from 'react';
import type {
  FlatListProps,
  ModalProps,
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { KeyValueItem, Row, ValueType } from '../core/types';
import type {
  MultiPickerOptions,
  PickerOptions,
  PickerState,
  SinglePickerOptions,
} from '../hook/types';
import type { PickerStrings } from '../theme/strings';
import type { DeepPartial, PickerTokens } from '../theme/tokens';

export interface PickerIcons {
  chevron: ReactNode;
  check: ReactNode;
  close: ReactNode;
  search: ReactNode;
}

/** Every element that accepts a style override. Applied after the defaults. */
export interface PickerStyles {
  container: StyleProp<ViewStyle>;
  label: StyleProp<TextStyle>;
  requiredMark: StyleProp<TextStyle>;
  trigger: StyleProp<ViewStyle>;
  triggerError: StyleProp<ViewStyle>;
  triggerDisabled: StyleProp<ViewStyle>;
  triggerText: StyleProp<TextStyle>;
  placeholder: StyleProp<TextStyle>;
  error: StyleProp<TextStyle>;
  backdrop: StyleProp<ViewStyle>;
  sheet: StyleProp<ViewStyle>;
  handle: StyleProp<ViewStyle>;
  header: StyleProp<ViewStyle>;
  title: StyleProp<TextStyle>;
  closeButton: StyleProp<ViewStyle>;
  searchContainer: StyleProp<ViewStyle>;
  searchInput: StyleProp<TextStyle>;
  list: StyleProp<ViewStyle>;
  listContent: StyleProp<ViewStyle>;
  row: StyleProp<ViewStyle>;
  rowSelected: StyleProp<ViewStyle>;
  rowDisabled: StyleProp<ViewStyle>;
  rowText: StyleProp<TextStyle>;
  rowTextSelected: StyleProp<TextStyle>;
  rowTextDisabled: StyleProp<TextStyle>;
  parentRow: StyleProp<ViewStyle>;
  parentText: StyleProp<TextStyle>;
  childRow: StyleProp<ViewStyle>;
  checkbox: StyleProp<ViewStyle>;
  checkboxChecked: StyleProp<ViewStyle>;
  empty: StyleProp<ViewStyle>;
  emptyText: StyleProp<TextStyle>;
  footer: StyleProp<ViewStyle>;
  footerButton: StyleProp<ViewStyle>;
  footerButtonText: StyleProp<TextStyle>;
  primaryButton: StyleProp<ViewStyle>;
  primaryButtonText: StyleProp<TextStyle>;
  chip: StyleProp<ViewStyle>;
  chipText: StyleProp<TextStyle>;
}

/** Contract for a custom sheet (`Sheet` prop/provider). */
export interface SheetProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Call once the close animation has finished. */
  onDismissed?: () => void;
  children: ReactNode;
  tokens: PickerTokens;
  styles: Partial<PickerStyles>;
  /** Keep a constant height (searchable lists) instead of fitting content. */
  fixedHeight: boolean;
  bottomInset: number;
  /** Fullscreen only; defaults to the Android status bar height. */
  topInset?: number;
  presentation: 'sheet' | 'fullscreen';
  modalProps?: Partial<ModalProps>;
  closeOnBackdropPress: boolean;
  /** Drag the handle/header down to close. Ignored when fullscreen. */
  swipeToClose?: boolean;
  testID?: string;
}

export interface TriggerRenderProps<T> {
  picker: PickerState<T>;
  /** Text the default trigger would show ('' when nothing is selected). */
  text: string;
  placeholder: string;
  error?: string;
  disabled: boolean;
  loading: boolean;
}

export interface ItemRenderProps<T> {
  row: Row<T>;
  selected: boolean;
  multiple: boolean;
  onPress: () => void;
}

export interface EmptyRenderProps {
  loading: boolean;
  searching: boolean;
  query: string;
  clearSearch: () => void;
}

export interface PickerUIProps<T> {
  label?: string;
  placeholder?: string;
  /** Sheet title; defaults to `label`, then `strings.title`. */
  title?: string;
  /** Shows the required marker after the label (no validation). */
  required?: boolean;
  /** Error message under the trigger; also turns the border red. */
  error?: string;
  /** Red border without a message. */
  invalid?: boolean;
  /** Shows a spinner in the trigger and the empty list. */
  loading?: boolean;

  /** Trigger text for multi-select. Default `labels`. */
  multipleDisplay?: 'labels' | 'count' | 'chips';
  /** Custom trigger text from the selected rows. */
  formatSelected?: (rows: Row<T>[]) => string;
  /**
   * Grouped options: prefix a selected child with its group, e.g.
   * "Fruits › Banana". Default `false` (just "Banana").
   */
  showParentLabel?: boolean;
  /** Separator used by `showParentLabel`. Default `" › "`. */
  parentLabelSeparator?: string;

  colorScheme?: 'auto' | 'light' | 'dark';
  tokens?: DeepPartial<PickerTokens>;
  styles?: Partial<PickerStyles>;
  strings?: Partial<PickerStrings>;
  icons?: Partial<PickerIcons>;

  presentation?: 'sheet' | 'fullscreen';
  /**
   * Space below the sheet content (navigation bar / home indicator).
   * Defaults to the bottom inset from `react-native-safe-area-context` when
   * the app has it installed, otherwise 0.
   */
  bottomInset?: number;
  /**
   * Fullscreen only: space above the header. Defaults to the top safe-area
   * inset when available, otherwise the Android status bar height.
   */
  topInset?: number;
  /** Default `true`. */
  closeOnBackdropPress?: boolean;
  /**
   * Drag the sheet's handle or header down to close it. Default `true`;
   * not available in fullscreen presentation.
   */
  swipeToClose?: boolean;
  /** Fires after the close animation (safe point to open another modal). */
  onDismiss?: () => void;
  /** Scroll the selected row into view on open. Default `true`. */
  autoScrollToSelected?: boolean;
  /** Keep parent rows pinned while scrolling their children. */
  stickyHeaders?: boolean;
  /**
   * Rows have a fixed height (fast `getItemLayout`, one-line labels).
   * Set `false` for multi-line labels. Default `true`.
   */
  fixedRowHeight?: boolean;

  Sheet?: ComponentType<SheetProps>;
  renderTrigger?: (props: TriggerRenderProps<T>) => ReactElement;
  renderItem?: (props: ItemRenderProps<T>) => ReactElement;
  renderEmpty?: (props: EmptyRenderProps) => ReactElement;
  listProps?: Omit<
    Partial<FlatListProps<Row<T>>>,
    'data' | 'renderItem' | 'keyExtractor'
  >;
  modalProps?: Partial<ModalProps>;
  searchInputProps?: TextInputProps;

  /** Trigger testID. */
  testID?: string;
  /** Row testID: a string for all rows, or per row. Item `testID` wins. */
  itemTestID?: string | ((row: Row<T>) => string | undefined);
}

export type ActionSheetPickerProps<
  T = KeyValueItem,
  V extends ValueType = ValueType,
> = PickerOptions<T, V> & PickerUIProps<T>;

export type SingleActionSheetPickerProps<
  T = KeyValueItem,
  V extends ValueType = ValueType,
> = SinglePickerOptions<T, V> & PickerUIProps<T>;

export type MultiActionSheetPickerProps<
  T = KeyValueItem,
  V extends ValueType = ValueType,
> = MultiPickerOptions<T, V> & PickerUIProps<T>;

export interface ActionSheetPickerHandle {
  open: () => void;
  close: () => void;
  /** Same as `open` — lets form libraries "focus" the field. */
  focus: () => void;
  clear: () => void;
}
