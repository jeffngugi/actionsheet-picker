# Infinite lists

Pass the three `pagination` fields. `onEndReached` fires **once per page**: it waits until the next page arrives or the user scrolls again, so you never get duplicate requests.

```tsx
const query = useInfiniteQuery({
  queryKey: ['banks', term],
  queryFn: ({ pageParam }) => api.banks({ page: pageParam, search: term }),
  initialPageParam: 1,
  getNextPageParam: (last) => last.nextPage ?? undefined,
});

<ActionSheetPicker
  items={query.data?.pages.flatMap((page) => page.items) ?? []}
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

<div class="shots">
  <figure>
    <img src="/screenshots/ios-remote.png" alt="Remote search results on iOS" />
    <figcaption>Remote search + infinite scroll</figcaption>
  </figure>
</div>

- **Duplicates removed.** Items repeated across pages are de-duplicated by value.
- **Label survives paging.** The selected label stays visible when the selected item is on a page that isn't loaded.
- **Loading states.** `loading` shows a spinner while the first page loads; `loadingMore` shows one at the bottom of the list.
- **Edit forms:** pass the saved item in [`selectedItems`](./items#values-not-in-items-yet) so its label shows before page 1 arrives.

::: tip Not using TanStack Query?
`pagination` only needs `hasMore`, `loadingMore` and `onEndReached`, so any data source works: RTK Query, SWR, Apollo or plain `fetch`.
:::
