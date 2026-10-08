# Customization

## Render props

Replace the trigger, the rows or the empty state, while the picker keeps the behaviour:

```tsx
<ActionSheetPicker
  renderTrigger={({ picker, text, placeholder, error }) => (
    <MyField onPress={picker.open} value={text || placeholder} error={error} />
  )}
  renderItem={({ row, selected, multiple, onPress }) => (
    <MyRow label={row.label} selected={selected} onPress={onPress} />
  )}
  renderEmpty={({ loading, searching, query, clearSearch }) => (
    <MyEmpty query={query} onClear={clearSearch} />
  )}
  formatSelected={(rows) => rows.map((r) => r.label).join(' + ')}
  …
/>
```

You can also pass props straight through to the underlying components: `listProps` (`FlatList`), `modalProps` (`Modal`) and `searchInputProps` (`TextInput`).

## Imperative control

```tsx
const ref = useRef<ActionSheetPickerHandle>(null);

<ActionSheetPicker ref={ref} … />;

ref.current?.open();
ref.current?.close();
ref.current?.focus(); // same as open; lets form libraries focus the field
ref.current?.clear();
```

## Your own sheet

Pass any component that implements `SheetProps` as `Sheet`, per picker or on the provider. For example, one built on `@gorhom/bottom-sheet` for gesture-handler-driven dragging:

```tsx
import type { SheetProps } from 'actionsheet-picker';

function MySheet({ visible, onRequestClose, onDismissed, children }: SheetProps) {
  // render `children` inside your sheet; call onRequestClose when the user
  // dismisses it and onDismissed once it has finished closing
}

<PickerProvider Sheet={MySheet}>…</PickerProvider>;
```

`SheetProps` also provides `tokens`, `styles`, `fixedHeight`, `bottomInset`, `topInset`, `presentation`, `modalProps`, `closeOnBackdropPress`, `swipeToClose` and `testID`. The default implementation is exported as `ModalSheet`.

## Headless hook

`useActionSheetPicker` gives you all the state and none of the UI:

```tsx
const picker = useActionSheetPicker({
  items,
  value,
  onChange,
  searchable: true,
});

picker.open();
picker.setQuery('ke');
picker.rows; // filtered rows to render
picker.selectRow(row);
picker.isSelected(row.valueKey);
picker.selectedRows; // for your trigger
```

It also provides `close`, `toggle`, `query`, `allRows`, `selectedKeys`, `removeValue`, `clear`, `commit`, `requiresCommit`, `isDirty`, `draftCount`, `resolveRow`, `onEndReached` and `onMomentumScrollBegin`.
