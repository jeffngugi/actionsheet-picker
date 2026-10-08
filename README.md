# actionsheet-picker

A searchable, grouped, infinite-scrolling picker for React Native that opens as a bottom sheet.

- **Zero native dependencies.** Only `react` and `react-native` are required. The sheet is built on `Modal`, `Animated` and `FlatList`.
- **Works with any form library.** The picker is a controlled input (`value` / `onChange` / `onBlur` / `error`). An optional react-hook-form adapter is included.
- **Single select by default**, with opt-in multi-select (`min`, `max`, a draft that applies on **Done**, and labels, count or chips display).
- **Key–value items by default** (`{ label, value }`). `schema` maps any other shape, so raw API data works as-is.
- **Optional grouped options:** nested children under any key, or flat items with parent references.
- **Local or remote search**, accent-insensitive by default (typing "cote" finds "Côte d'Ivoire"), with built-in debounce for remote search.
- **Infinite lists:** `pagination` loads the next page once per scroll, with no duplicate requests.
- **The selected label stays visible** even when the item is no longer in `items` (remote search, other pages, edit forms).
- **Mobile-ready:** swipe down to close, Android back button, keyboard-aware on Android and iOS, safe areas, reduce-motion support, screen-reader labels and states.
- **Fully themeable:** neutral light and dark tokens, style slots, render props, custom icons and strings, or your own sheet.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Items and `schema`](#items-and-schema)
- [Grouped options](#grouped-options)
- [Search](#search)
- [Infinite lists](#infinite-lists)
- [Multi-select](#multi-select)
- [Forms](#forms)
- [Theming](#theming)
- [Localization](#localization)
- [Safe areas, keyboard and presentation](#safe-areas-keyboard-and-presentation)
- [Customization](#customization)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [API reference](#api-reference)
- [Compatibility](#compatibility)
- [Known limitations](#known-limitations)

## Installation

```sh
npm install actionsheet-picker
# or
yarn add actionsheet-picker
```

The only required peer dependencies are `react` (≥ 18) and `react-native` (≥ 0.72). Two optional peers add features if your app already has them:

| Optional peer                          | What it adds                                                       |
| -------------------------------------- | ------------------------------------------------------------------ |
| `react-native-safe-area-context` (≥ 4) | Automatic padding for the home indicator, navigation bar and notch |
| `react-hook-form` (≥ 7.40)             | The `actionsheet-picker/react-hook-form` adapter                   |

Nothing else needs to be installed or linked.

## Quick start

```tsx
import { useState } from 'react';
import { ActionSheetPicker } from 'actionsheet-picker';

const countries = [
  { label: 'Kenya', value: 'KE' },
  { label: 'Uganda', value: 'UG' },
  { label: 'Tanzania', value: 'TZ' },
];

export function CountryField() {
  const [country, setCountry] = useState<string | null>(null);

  return (
    <ActionSheetPicker
      label="Country"
      items={countries}
      value={country}
      onChange={setCountry}
      searchable
    />
  );
}
```

`onChange` receives the value and the selected item: `onChange(value, item)`.

## Items and `schema`

Items are `{ label, value }` by default. Values can be strings or numbers, and `1` matches `'1'`. Optional fields per item: `disabled`, `selectable` and `testID`.

To use other key names, map them with `schema`. Each entry is a property name or a function:

```tsx
const banks = [
  { id: 101, bank_name: 'Equatorial Bank', swift: 'EQBKXX', closed: false },
];

<ActionSheetPicker
  items={banks}
  schema={{
    value: 'id',
    label: (bank) => `${bank.bank_name} (${bank.swift})`,
    disabled: 'closed',
  }}
  value={bankId}
  onChange={(id, bank) => setBankId(id)}
/>;
```

## Grouped options

Pass `hierarchy` to show options under group headers. Groups can't be picked, and a group without children behaves as a normal option.

**Nested children** under any key (default `children`):

```tsx
const groups = [
  {
    label: 'Fruits',
    value: 10,
    options: [
      { label: 'Apple', value: 11 },
      { label: 'Banana', value: 12 },
    ],
  },
  { label: 'Water', value: 20 },
];

<ActionSheetPicker
  items={groups}
  hierarchy={{ type: 'nested', childrenKey: 'options' }}
  searchable // optional, as for flat lists
  stickyHeaders // optional: keep the group header visible while scrolling
  value={value}
  onChange={setValue}
/>;
```

**Flat items with parent references** (default key `parent`):

```tsx
<ActionSheetPicker
  items={[
    { label: 'Fruits', value: 10 },
    { label: 'Apple', value: 11, parent_id: 10 },
  ]}
  hierarchy={{ type: 'flat', parentKey: 'parent_id' }}
  value={value}
  onChange={setValue}
/>
```

- **Search matches options at every level.** A matching option keeps its group header, and a matching group shows all its options.
- **Selected labels:** by default the trigger shows just the option ("Banana"). Set `showParentLabel` to show "Fruits › Banana", and `parentLabelSeparator` to change the " › ".
- **Selectable groups:** set `selectableParents`, or `selectable: true` on an individual item, to let groups be picked.
- **Paged groups:** a group that appears again on a later page is merged, not duplicated.

## Search

```tsx
<ActionSheetPicker searchable … />                  // local, accent-insensitive
<ActionSheetPicker searchable={{ filter: (item, q) => item.code.startsWith(q) }} … />
```

**Remote search:** the picker owns the text field and reports changes to you, debounced. It never filters `items` itself in this mode:

```tsx
const [term, setTerm] = useState('');
const { data, isFetching } = useQuery({
  queryKey: ['people', term],
  queryFn: () => api.people(term),
});

<ActionSheetPicker
  items={data ?? []}
  schema={{ value: 'id', label: 'name' }}
  searchable={{
    mode: 'remote',
    onChangeText: setTerm,
    debounceMs: 300,
    searching: isFetching,
  }}
  value={personId}
  onChange={setPersonId}
/>;
```

When the sheet closes, the search text is cleared and remote mode sends `''` once, so the next open shows the unfiltered list. Set `clearOnClose: false` to keep the text. Typed text is never overwritten by the parent re-rendering.

## Infinite lists

Pass the three `pagination` fields. `onEndReached` fires once per page, until the next page arrives or the user scrolls again:

```tsx
const query = useInfiniteQuery({
  queryKey: ['banks', term],
  queryFn: ({ pageParam }) => api.banks({ page: pageParam, search: term }),
  initialPageParam: 1,
  getNextPageParam: (last) => last.nextPage ?? undefined,
});

<ActionSheetPicker
  items={query.data?.pages.flatMap((p) => p.items) ?? []}
  schema={{ value: 'id', label: 'name' }}
  searchable={{ mode: 'remote', onChangeText: setTerm }}
  loading={query.isLoading}
  pagination={{
    hasMore: Boolean(query.hasNextPage),
    loadingMore: query.isFetchingNextPage,
    onEndReached: query.fetchNextPage,
  }}
  value={bankId}
  onChange={setBankId}
/>;
```

**Edit forms:** if the saved value may not be on the first page yet, pass it in `selectedItems` so its label shows immediately:

```tsx
<ActionSheetPicker selectedItems={[{ id: 42, name: 'Saved Bank' }]} … />
```

## Multi-select

Opt in with `multiple`. `value` is an array, and `onChange` receives `(values, items)`:

```tsx
<ActionSheetPicker
  multiple
  items={countries}
  value={codes}
  onChange={setCodes}
  min={1}
  max={3}
  onLimitReached={(limit) =>
    showToast(limit === 'max' ? 'Up to 3' : 'Pick at least 1')
  }
  multipleDisplay="chips" // 'labels' (default) · 'count' · 'chips'
/>
```

- **`confirmMode`:** `'done'` (default) keeps picks as a draft until **Done**; closing without Done discards them. `'instant'` applies every tap.
- **Clear all** in the sheet clears the draft. Chips can be removed straight from the trigger.

## Forms

The picker is a plain controlled input, so it works with any form library.

### react-hook-form (included adapter)

```tsx
import { RHFActionSheetPicker } from 'actionsheet-picker/react-hook-form';

const { control, handleSubmit } = useForm({ defaultValues: { country: null } });

<RHFActionSheetPicker
  control={control}
  name="country"
  rules={{ required: 'Please select a country' }}
  label="Country"
  items={countries}
  onChange={(value, item) => {
    /* optional side effect, after the form updates */
  }}
/>;
```

- **Value and touched:** the field value comes from react-hook-form, and closing the sheet marks the field touched.
- **Errors:** rule errors show under the field, and the required marker follows `rules.required`.
- **Focus:** `setFocus` and focus-on-first-error open the sheet.
- **Type checks:** `name` is checked against your form's fields.
- **Optional dependency:** the main `actionsheet-picker` entry never imports react-hook-form.

### Other form libraries

<details>
<summary>useState</summary>

```tsx
const [value, setValue] = useState<string | null>(null);
const [touched, setTouched] = useState(false);

<ActionSheetPicker
  items={countries}
  value={value}
  onChange={setValue}
  onBlur={() => setTouched(true)}
  error={touched && !value ? 'Required' : undefined}
  required
/>;
```

</details>

<details>
<summary>Formik</summary>

```tsx
const [field, meta, helpers] = useField('country');

<ActionSheetPicker
  items={countries}
  value={field.value}
  onChange={(v) => helpers.setValue(v)}
  onBlur={() => helpers.setTouched(true)}
  error={meta.touched ? meta.error : undefined}
/>;
```

</details>

<details>
<summary>TanStack Form</summary>

```tsx
<form.Field name="country">
  {(field) => (
    <ActionSheetPicker
      items={countries}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={field.state.meta.errors[0]}
    />
  )}
</form.Field>
```

</details>

## Theming

Defaults are neutral, and light and dark follow the system. Override **tokens** (colors, spacing, radii, sizes, typography, motion) per picker or app-wide:

```tsx
import { PickerProvider } from 'actionsheet-picker';

<PickerProvider
  colorScheme="light" // set this if your app has no dark mode
  tokens={{
    colors: { accent: '#2E7D32', selectedBg: 'rgba(46,125,50,0.1)' },
    radii: { input: 4, sheet: 24 },
    typography: {
      fontFamily: 'Inter-Regular',
      fontFamilyBold: 'Inter-SemiBold',
    },
  }}
  darkTokens={{ colors: { accent: '#81C784' } }}
>
  <App />
</PickerProvider>;
```

> **Light-only apps:** `colorScheme` defaults to `'auto'`, so pickers go dark when the device is in dark mode. If your app doesn't support dark mode, set `colorScheme="light"` on the provider.

For one-off tweaks, use **style slots**, which are applied after the defaults:

```tsx
<ActionSheetPicker styles={{ trigger: { borderRadius: 12 }, rowTextSelected: { fontWeight: '700' } }} … />
```

Available slots: `container`, `label`, `requiredMark`, `trigger`, `triggerError`, `triggerDisabled`, `triggerText`, `placeholder`, `error`, `backdrop`, `sheet`, `handle`, `header`, `title`, `closeButton`, `searchContainer`, `searchInput`, `list`, `listContent`, `row`, `rowSelected`, `rowDisabled`, `rowText`, `rowTextSelected`, `rowTextDisabled`, `parentRow`, `parentText`, `childRow`, `checkbox`, `checkboxChecked`, `empty`, `emptyText`, `footer`, `footerButton`, `footerButtonText`, `primaryButton`, `primaryButtonText`, `chip`, `chipText`.

**Icons** (`chevron`, `check`, `close`, `search`) can be replaced with any element, e.g. your SVGs: `icons={{ chevron: <ChevronDown /> }}`.

## Localization

All built-in text comes from `strings` (per picker or on the provider), so plug in your i18n library:

```tsx
<PickerProvider
  strings={{
    placeholder: t('select'),
    searchPlaceholder: t('search'),
    empty: t('nothingToShow'),
    clearSearch: t('clearSearch'),
    done: t('done'),
    selectedCount: (n) => t('selectedCount', { count: n }),
  }}
>
```

| Key                 | Default                                              |
| ------------------- | ---------------------------------------------------- |
| `placeholder`       | Select an option                                     |
| `title`             | Select (sheet title when there's no `title`/`label`) |
| `searchPlaceholder` | Search                                               |
| `searching`         | Searching…                                           |
| `empty`             | Nothing to show                                      |
| `clearSearch`       | Clear search                                         |
| `close`             | Close                                                |
| `done`              | Done                                                 |
| `clearAll`          | Clear all                                            |
| `loadingMore`       | Loading more…                                        |
| `selectedCount(n)`  | `${n} selected`                                      |
| `more(n)`           | `+${n}`                                              |
| `remove(label)`     | `Remove ${label}`                                    |

## Safe areas, keyboard and presentation

- **Safe areas:** with `react-native-safe-area-context` installed, the sheet pads itself for the home indicator or navigation bar, and fullscreen mode clears the notch or Dynamic Island. No `SafeAreaProvider` is needed inside the modal. Without the package, pass `bottomInset` / `topInset` yourself. Explicit props always win.
- **Keyboard:** the list stays above the keyboard on Android (including edge-to-edge Android 15+) and iOS. While the keyboard is open, a searchable sheet grows to just below the status bar so more results fit.
- **Closing:** tap the backdrop (`closeOnBackdropPress`), tap ✕, press the Android back button, or swipe the handle or header down (`swipeToClose`). `onDismiss` fires after the close animation, which is the safe point to open another modal on iOS.
- **`presentation="fullscreen"`** shows a full-screen list instead of a bottom sheet.
- **Reduce motion:** animations are skipped when the OS setting is on.

## Customization

```tsx
// Replace parts of the UI
<ActionSheetPicker
  renderTrigger={({ picker, text, placeholder }) => (
    <MyField onPress={picker.open} value={text || placeholder} />
  )}
  renderItem={({ row, selected, onPress }) => (
    <MyRow label={row.label} selected={selected} onPress={onPress} />
  )}
  renderEmpty={({ query, clearSearch }) => (
    <MyEmpty query={query} onClear={clearSearch} />
  )}
  listProps={{ initialNumToRender: 30 }}
  searchInputProps={{ autoFocus: true }}
/>;

// Imperative control
const ref = useRef<ActionSheetPickerHandle>(null);
ref.current?.open(); // also: close(), focus() (= open), clear()
```

**Your own sheet:** pass any component that implements `SheetProps` as `Sheet`, per picker or on the provider (for example, one built on `@gorhom/bottom-sheet`). It receives `visible`, `onRequestClose`, `onDismissed` and the content.

**Headless:** `useActionSheetPicker(options)` gives you all the state without any UI: open/close, query, filtered `rows`, selection, `selectRow`, `commit`, `resolveRow` and pagination handlers. Build a completely custom picker on top of it.

## Testing

- `testID` goes on the trigger. The sheet parts use derived IDs: `${testID}-sheet`, `-backdrop`, `-handle`, `-header`, `-close`, `-search`, `-list`, `-done`, `-clear`.
- `itemTestID` (a string or `(row) => string`) goes on rows. An item's own `testID` field wins.
- Pass `tokens={{ motion: { durationIn: 0, durationOut: 0 } }}` in unit tests so the sheet opens and closes synchronously.

## Accessibility

- **Trigger:** a button with the label, its value (the selection, or the placeholder when empty) and an expanded state.
- **Rows:** buttons with a selected state, or checkboxes with a checked state in multi-select. Group headers are announced as headers, and disabled rows as disabled.
- **Sheet:** the close and clear buttons and the chip remove buttons are labelled (from `strings`).
- **Reduce motion** is respected.

## API reference

<details>
<summary><b>ActionSheetPicker props</b></summary>

**Data and value**

| Prop                | Type                                                                | Default             |                                                |
| ------------------- | ------------------------------------------------------------------- | ------------------- | ---------------------------------------------- |
| `items`             | `T[]`                                                               | —                   | Options (raw objects are fine with `schema`)   |
| `value`             | `V \| null` · `V[]` with `multiple`                                 | —                   | Controlled value                               |
| `onChange`          | `(value, item)` · `(values, items)` with `multiple`                 | —                   |                                                |
| `schema`            | `{ label, value, disabled, selectable, testID }`                    | `label`, `value`, … | Property names or functions                    |
| `hierarchy`         | `{ type: 'nested', childrenKey? }` · `{ type: 'flat', parentKey? }` | —                   | Grouped options                                |
| `selectableParents` | `boolean`                                                           | `false`             | Allow picking groups                           |
| `selectedItems`     | `T[]`                                                               | —                   | Labels for values not in `items` yet           |
| `multiple`          | `boolean`                                                           | `false`             |                                                |
| `min` / `max`       | `number`                                                            | —                   | Multi limits                                   |
| `onLimitReached`    | `(limit: 'min' \| 'max') => void`                                   | —                   |                                                |
| `confirmMode`       | `'done' \| 'instant'`                                               | `'done'`            | Multi: apply on Done, or on every tap          |
| `closeOnSelect`     | `boolean`                                                           | `true`              | Single                                         |
| `allowDeselect`     | `boolean`                                                           | `false`             | Single: tap the selected row again to clear it |

**Search and paging**

| Prop         | Type                                     | Default |                                       |
| ------------ | ---------------------------------------- | ------- | ------------------------------------- |
| `searchable` | `boolean \| SearchConfig`                | `false` |                                       |
| `pagination` | `{ hasMore, loadingMore, onEndReached }` | —       | Infinite lists                        |
| `loading`    | `boolean`                                | `false` | Spinner in the trigger and empty list |

`SearchConfig`: `mode` (`'local'` \| `'remote'`), `onChangeText`, `debounceMs` (300, remote), `searching`, `accentInsensitive` (`true`), `filter(item, query)`, `clearOnSelect` (`false`, multi), `clearOnClose` (`true`).

**Field**

| Prop                   | Type                             | Default               |                                     |
| ---------------------- | -------------------------------- | --------------------- | ----------------------------------- |
| `label`                | `string`                         | —                     | Also the sheet title                |
| `placeholder`          | `string`                         | `strings.placeholder` |                                     |
| `title`                | `string`                         | `label`               | Sheet title                         |
| `required`             | `boolean`                        | `false`               | Shows ` *` (no validation)          |
| `error`                | `string`                         | —                     | Message under the field, red border |
| `invalid`              | `boolean`                        | `false`               | Red border only                     |
| `disabled`             | `boolean`                        | `false`               |                                     |
| `multipleDisplay`      | `'labels' \| 'count' \| 'chips'` | `'labels'`            |                                     |
| `formatSelected`       | `(rows) => string`               | —                     | Custom trigger text                 |
| `showParentLabel`      | `boolean`                        | `false`               | "Group › Option"                    |
| `parentLabelSeparator` | `string`                         | `' › '`               |                                     |

**Sheet**

| Prop                                          | Type                         | Default          |                                                          |
| --------------------------------------------- | ---------------------------- | ---------------- | -------------------------------------------------------- |
| `presentation`                                | `'sheet' \| 'fullscreen'`    | `'sheet'`        |                                                          |
| `swipeToClose`                                | `boolean`                    | `true`           | Not available in fullscreen                              |
| `closeOnBackdropPress`                        | `boolean`                    | `true`           |                                                          |
| `bottomInset` / `topInset`                    | `number`                     | safe-area insets |                                                          |
| `autoScrollToSelected`                        | `boolean`                    | `true`           |                                                          |
| `stickyHeaders`                               | `boolean`                    | `false`          | Grouped options                                          |
| `fixedRowHeight`                              | `boolean`                    | `true`           | `false` for multi-line labels                            |
| `open` / `onOpenChange`                       | `boolean` / `(open) => void` | —                | Controlled open state                                    |
| `onOpen` / `onClose` / `onBlur` / `onDismiss` | `() => void`                 | —                | `onBlur` on every close, `onDismiss` after the animation |

**Look and customization**

| Prop                                            | Type                                         |
| ----------------------------------------------- | -------------------------------------------- |
| `colorScheme`                                   | `'auto' \| 'light' \| 'dark'`                |
| `tokens`                                        | `DeepPartial<PickerTokens>`                  |
| `styles`                                        | `Partial<PickerStyles>`                      |
| `strings`                                       | `Partial<PickerStrings>`                     |
| `icons`                                         | `Partial<{ chevron, check, close, search }>` |
| `Sheet`                                         | `ComponentType<SheetProps>`                  |
| `renderTrigger` / `renderItem` / `renderEmpty`  | render functions                             |
| `listProps` / `modalProps` / `searchInputProps` | passed to `FlatList` / `Modal` / `TextInput` |
| `testID` / `itemTestID`                         | `string` / `string \| (row) => string`       |

</details>

<details>
<summary><b>PickerProvider props</b></summary>

`colorScheme`, `tokens`, `darkTokens` (applied in dark mode only), `strings`, `icons`, `styles`, `Sheet`. Props on a picker override the provider, and nested providers merge.

</details>

## Compatibility

- **React** ≥ 18 and **React Native** ≥ 0.72, including Expo and Expo Go. The package contains no native code, so it doesn't depend on the React Native architecture (old or new) or the JS engine.
- **Checked on:** Android 15 (physical device) and iOS 18 (simulator), with React Native 0.86 and React 19.
- **Typechecked in CI** against React 18.3 + React Native 0.76, with both classic and bundler module resolution (`yarn compat`).
- **Bundlers:** the `react-hook-form` subpath works with or without `package.json` `exports` support. Optional peers are loaded through optional `require`, which Metro supports through React Native's and Expo's default configs.

## Known limitations

- **Two levels of grouping:** group → option. Deeper trees aren't supported yet.
- **Same value under two groups:** values are keys, so an identical value in two groups is treated as one option.
- **VoiceOver focus behind the sheet:** with React Native's transparent `Modal`, iOS may let VoiceOver move to content behind the sheet. This hasn't been verified on a physical device yet.
- **Dragging runs on the JS thread:** swipe-to-close uses `PanResponder`. For gesture-handler-driven sheets, pass your own `Sheet`.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT © Geoffrey Ngugi

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
