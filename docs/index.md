---
layout: home

hero:
  name: actionsheet-picker
  text: The bottom-sheet picker for React Native
  tagline: Searchable, grouped, infinite-scrolling, single or multi select. Zero native dependencies.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: See examples
      link: /examples
    - theme: alt
      text: GitHub
      link: https://github.com/jeffngugi/actionsheet-picker

features:
  - title: Zero native dependencies
    details: Only react and react-native. Built on Modal, Animated and FlatList, so it works in Expo Go with nothing to link.
  - title: Works with any form library
    details: A controlled input (value, onChange, onBlur, error). An optional react-hook-form adapter is included.
  - title: Search, local or remote
    details: Accent-insensitive local search, or debounced remote search where you fetch and the picker keeps typing smooth.
  - title: Grouped options
    details: Nested children under any key, or flat items with parent references. Search keeps each match's group.
  - title: Infinite lists
    details: Pagination loads one page per scroll, with no duplicate requests. Selected labels survive paging and search.
  - title: Mobile-ready
    details: Swipe to close, Android back button, keyboard-aware on both platforms, safe areas, reduce motion, screen-reader labels.
---

<div class="shots" style="justify-content: center; margin-top: 48px;">
  <figure>
    <img src="/screenshots/ios-basic.png" alt="Single select sheet on iOS" />
    <figcaption>Single select · iOS</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-grouped-multi.png" alt="Grouped multi-select on iOS" />
    <figcaption>Grouped multi-select · iOS</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/android-search.png" alt="Search with keyboard on Android, dark theme" />
    <figcaption>Search · Android dark</figcaption>
  </figure>
</div>

```tsx
import { ActionSheetPicker } from 'actionsheet-picker';

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
