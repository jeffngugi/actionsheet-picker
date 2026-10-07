# actionsheet-picker

A searchable, hierarchical, infinite-scrolling picker for React Native that opens as a bottom action sheet.

- **Zero native dependencies.** Only `react` and `react-native` are required. It's built on `Modal`, `Animated`, `FlatList`, `Pressable` and `TextInput`.
- **Works with any form library.** The picker is a plain controlled input (`value` / `onChange` / `onBlur` / `error`). An optional `react-hook-form` adapter is included.
- **Single select by default**, with opt-in multi-select (`min`, `max`, a confirm step, and count / labels / chips display).
- **Key–value items by default** (`{ label, value }`). A `schema` prop maps other key names, so you can pass raw API data.
- **Optional hierarchy:** nested (`children` or any key you choose) or flat with parent references.
- **Local or remote search**, with built-in debounce and accent-insensitive matching.
- **Infinite lists** through the `pagination` prop, with duplicate-request protection.
- **Keeps the selected label** when the selected item isn't in the current page or search results.
- **Fully themeable:** neutral light and dark tokens, style slots, render props, custom icons and strings, RTL support.

> 🚧 Under active development. The API below is the target for `0.1.0`.

## Installation

```sh
npm install actionsheet-picker
# or
yarn add actionsheet-picker
```

## Usage

```tsx
import { ActionSheetPicker } from 'actionsheet-picker';

const [country, setCountry] = useState<string | null>(null);

<ActionSheetPicker
  label="Country"
  items={[
    { label: 'Kenya', value: 'KE' },
    { label: 'Uganda', value: 'UG' },
  ]}
  value={country}
  onChange={setCountry}
  searchable
/>;
```

### Hierarchy

```tsx
<ActionSheetPicker
  items={categories}
  hierarchy={{ type: 'nested', childrenKey: 'subCategories' }}
  value={categoryId}
  onChange={setCategoryId}
/>
```

### Infinite list with remote search

```tsx
<ActionSheetPicker
  items={pages.flat()}
  schema={{ label: 'name', value: 'id' }}
  searchable
  search={{ mode: 'remote', onChangeText: setTerm }}
  pagination={{ hasMore, loadingMore, onEndReached: fetchNextPage }}
  value={id}
  onChange={setId}
/>
```

### react-hook-form (optional)

```tsx
import { RHFActionSheetPicker } from 'actionsheet-picker/react-hook-form';

<RHFActionSheetPicker
  control={control}
  name="country"
  rules={{ required: 'Required' }}
  items={countries}
/>;
```

## Roadmap

- [x] Phase 0: scaffold, tooling, CI
- [ ] Phase 1: pure core (schema, rows, hierarchy, search, selection, cache, pagination merge)
- [ ] Phase 2: `useActionSheetPicker` headless hook
- [ ] Phase 3: default UI (RN Modal sheet, FlatList, themes) + example screens
- [ ] Phase 4: `react-hook-form` adapter
- [ ] Phase 5: docs and `0.1.0` release

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
