# Localization

All built-in text comes from `strings`, set per picker or on the provider, so you can plug in your i18n library:

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
  <App />
</PickerProvider>
```

| Key | Default |
| --- | --- |
| `placeholder` | Select an option |
| `title` | Select (sheet title when there's no `title` or `label`) |
| `searchPlaceholder` | Search |
| `searching` | Searching… |
| `empty` | Nothing to show |
| `clearSearch` | Clear search |
| `close` | Close |
| `done` | Done |
| `clearAll` | Clear all |
| `loadingMore` | Loading more… |
| `selectedCount(n)` | `` `${n} selected` `` |
| `more(n)` | `` `+${n}` `` |
| `remove(label)` | `` `Remove ${label}` `` |

The English defaults are exported as `defaultStrings`.
