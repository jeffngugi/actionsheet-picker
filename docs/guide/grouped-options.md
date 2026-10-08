# Grouped options

Pass `hierarchy` to show options under group headers. Groups can't be picked, and a group without children behaves as a normal option.

<div class="shots">
  <figure>
    <img src="/screenshots/ios-grouped.png" alt="Grouped options with headers on iOS" />
    <figcaption>Single select</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-grouped-multi.png" alt="Grouped multi-select with checkboxes on iOS" />
    <figcaption>Multi-select</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/android-grouped-multi.png" alt="Grouped multi-select on Android, dark theme" />
    <figcaption>Android · dark theme</figcaption>
  </figure>
</div>

## Nested children

Children under any key (default `children`):

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

## Flat items with parent references

Items that point at their group (default key `parent`):

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

## Behaviour

- **Search is optional.** Add `searchable` to search inside groups. A matching option keeps its group header, and a matching group shows all its options.
- **Selected label:** the trigger shows just the option ("Banana"). Set `showParentLabel` to show "Fruits › Banana", and `parentLabelSeparator` to change the " › ".
- **Selectable groups:** set `selectableParents`, or `selectable: true` on an individual group.
- **Paged data:** a group that appears again on a later page is merged, not duplicated.
- **Two levels:** group → option. Deeper trees aren't supported yet.
