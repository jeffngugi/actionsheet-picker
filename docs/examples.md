# Examples

Screenshots come from the [example app](https://github.com/jeffngugi/actionsheet-picker/tree/main/example) on an iOS simulator (light theme) and an Android emulator (dark theme).

## iOS

<div class="shots">
  <figure>
    <img src="/screenshots/ios-basic.png" alt="Single select" />
    <figcaption>Single select</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-search.png" alt="Search with keyboard" />
    <figcaption>Search with the keyboard open</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-schema.png" alt="Raw API objects with schema and a disabled item" />
    <figcaption>Schema mapping + disabled item</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-grouped.png" alt="Grouped options" />
    <figcaption>Grouped options</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-grouped-multi.png" alt="Grouped multi-select" />
    <figcaption>Grouped multi-select</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-chips.png" alt="Multi-select labels and chips" />
    <figcaption>Labels and chips</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-remote.png" alt="Remote search and infinite scroll" />
    <figcaption>Remote search + infinite scroll</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-fullscreen.png" alt="Fullscreen with custom tokens" />
    <figcaption>Fullscreen + custom tokens</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-form.png" alt="react-hook-form validation" />
    <figcaption>react-hook-form validation</figcaption>
  </figure>
</div>

## Android (dark theme)

<div class="shots">
  <figure>
    <img src="/screenshots/android-basic.png" alt="Single select, dark theme" />
    <figcaption>Single select</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/android-search.png" alt="Search with keyboard, dark theme" />
    <figcaption>Search with the keyboard open</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/android-grouped-multi.png" alt="Grouped multi-select, dark theme" />
    <figcaption>Grouped multi-select</figcaption>
  </figure>
</div>

## Run the example app

```sh
git clone https://github.com/jeffngugi/actionsheet-picker.git
cd actionsheet-picker
yarn
yarn example start   # then press i (iOS) or a (Android), or scan with Expo Go
```

The example covers every feature on one screen: single select, search, schema mapping, grouped options (with search and group-label switches), multi-select, remote search with infinite scroll, error and disabled states, theming, fullscreen, react-hook-form, and a picker inside another modal.
