# API reference

## `<ActionSheetPicker>`

### Data and value

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `items` | `T[]` | — | Options (raw objects are fine with `schema`) |
| `value` | `V \| null` · `V[]` with `multiple` | — | Controlled value |
| `onChange` | `(value, item)` · `(values, items)` with `multiple` | — | |
| `schema` | `{ label, value, disabled, selectable, testID }` | `'label'`, `'value'`, … | Property names or functions |
| `hierarchy` | `{ type: 'nested', childrenKey? }` · `{ type: 'flat', parentKey? }` | — | [Grouped options](/guide/grouped-options) |
| `selectableParents` | `boolean` | `false` | Allow picking groups |
| `selectedItems` | `T[]` | — | Labels for values not in `items` yet |
| `multiple` | `boolean` | `false` | [Multi-select](/guide/multi-select) |
| `min` / `max` | `number` | — | Multi-select limits |
| `onLimitReached` | `(limit: 'min' \| 'max') => void` | — | |
| `confirmMode` | `'done' \| 'instant'` | `'done'` | Multi-select: apply on Done, or on every tap |
| `closeOnSelect` | `boolean` | `true` | Single select |
| `allowDeselect` | `boolean` | `false` | Single select: tap the selected row again to clear it |

### Search and paging

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `searchable` | `boolean \| SearchConfig` | `false` | [Search](/guide/search#options) |
| `pagination` | `{ hasMore, loadingMore, onEndReached }` | — | [Infinite lists](/guide/infinite-lists) |
| `loading` | `boolean` | `false` | Spinner in the trigger and empty list |

### Field

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `label` | `string` | — | Also the sheet title |
| `placeholder` | `string` | `strings.placeholder` | |
| `title` | `string` | `label` | Sheet title |
| `required` | `boolean` | `false` | Shows ` *` (no validation) |
| `error` | `string` | — | Message under the field, red border |
| `invalid` | `boolean` | `false` | Red border only |
| `disabled` | `boolean` | `false` | |
| `multipleDisplay` | `'labels' \| 'count' \| 'chips'` | `'labels'` | |
| `formatSelected` | `(rows) => string` | — | Custom trigger text |
| `showParentLabel` | `boolean` | `false` | "Group › Option" |
| `parentLabelSeparator` | `string` | `' › '` | |

### Sheet

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `presentation` | `'sheet' \| 'fullscreen'` | `'sheet'` | |
| `swipeToClose` | `boolean` | `true` | Not available in fullscreen |
| `closeOnBackdropPress` | `boolean` | `true` | |
| `bottomInset` / `topInset` | `number` | safe-area insets | |
| `autoScrollToSelected` | `boolean` | `true` | |
| `stickyHeaders` | `boolean` | `false` | Grouped options |
| `fixedRowHeight` | `boolean` | `true` | `false` for multi-line labels |
| `open` / `onOpenChange` | `boolean` / `(open) => void` | — | Controlled open state |
| `onOpen` / `onClose` / `onBlur` / `onDismiss` | `() => void` | — | `onBlur` fires on every close; `onDismiss` after the animation |

### Look and customization

| Prop | Type |
| --- | --- |
| `colorScheme` | `'auto' \| 'light' \| 'dark'` |
| `tokens` | `DeepPartial<PickerTokens>` |
| `styles` | `Partial<PickerStyles>` |
| `strings` | `Partial<PickerStrings>` |
| `icons` | `Partial<{ chevron, check, close, search }>` |
| `Sheet` | `ComponentType<SheetProps>` |
| `renderTrigger` / `renderItem` / `renderEmpty` | render functions |
| `listProps` / `modalProps` / `searchInputProps` | passed to `FlatList` / `Modal` / `TextInput` |
| `testID` / `itemTestID` | `string` / `string \| (row) => string` |

### Ref (`ActionSheetPickerHandle`)

`open()`, `close()`, `focus()` (same as open), `clear()`.

## `<PickerProvider>`

App-wide defaults: `colorScheme`, `tokens`, `darkTokens` (applied in dark mode only), `strings`, `icons`, `styles`, `Sheet`. Props on a picker override the provider, and nested providers merge.

## `<RHFActionSheetPicker>`

From `actionsheet-picker/react-hook-form`. Takes all picker props except `value`, `onBlur` and `error` (the form provides them, and `onChange` becomes optional), plus:

| Prop | Type | |
| --- | --- | --- |
| `control` | `Control` | from `useForm` |
| `name` | field path | checked against your form's fields |
| `rules` | `RegisterOptions` | `required` also shows the ` *` marker |
| `defaultValue` | field value | prefer `useForm({ defaultValues })` |
| `shouldUnregister` | `boolean` | |
| `onChange` | `(value, item)` · `(values, items)` | optional; runs after the form updates |

## `useActionSheetPicker(options)`

Takes the same data, value, search and paging options as the component, and returns:

| Field | |
| --- | --- |
| `isOpen`, `open()`, `close()`, `toggle()` | Open state |
| `query`, `setQuery(text)`, `searchable`, `searchMode`, `searching` | Search |
| `rows`, `allRows` | Filtered and all rows |
| `selectedKeys`, `isSelected(key)`, `selectedRows`, `hasValue` | Selection |
| `selectRow(row)`, `removeValue(value)`, `clear()` | Changes |
| `commit()`, `requiresCommit`, `isDirty`, `draftCount` | Multi-select draft |
| `resolveRow(key)` | Any row the picker has seen |
| `onEndReached()`, `onMomentumScrollBegin()` | Wire to your list for pagination |

## Exports

```ts
import {
  ActionSheetPicker,
  PickerProvider,
  useActionSheetPicker,
  ModalSheet,
  lightTokens,
  darkTokens,
  mergeTokens,
  defaultStrings,
  // core helpers
  buildRows,
  createAccessors,
  filterRows,
  keyOf,
} from 'actionsheet-picker';

import { RHFActionSheetPicker } from 'actionsheet-picker/react-hook-form';
```

Types include `ActionSheetPickerProps`, `SingleActionSheetPickerProps`, `MultiActionSheetPickerProps`, `ActionSheetPickerHandle`, `PickerTokens`, `PickerStrings`, `PickerStyles`, `PickerIcons`, `SheetProps`, `Row`, `Hierarchy`, `ItemSchema` and `PickerState`.
