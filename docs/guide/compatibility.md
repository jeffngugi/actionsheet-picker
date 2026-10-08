# Compatibility

| | Supported |
| --- | --- |
| React | ≥ 18 |
| React Native | ≥ 0.72 |
| Expo | Yes, including Expo Go (no native code) |
| Architecture / JS engine | Independent: the package contains no native code |

## Verified

- **Devices:** Android 15 (physical device) and iOS 18 (simulator), with React Native 0.86 and React 19.
- **Typechecked in CI** against React 18.3 + React Native 0.76 with both classic and bundler module resolution (`yarn compat`).

## Bundlers

- **react-hook-form subpath:** `actionsheet-picker/react-hook-form` resolves with or without `package.json` `exports` support. A folder stub covers older Metro versions.
- **Optional peers:** loaded through an optional `require`. Metro supports this through React Native's and Expo's default configs (`allowOptionalDependencies`).

## Known limitations

- **Two levels of grouping:** group → option.
- **Same value under two groups:** values are keys, so an identical value in two groups is treated as one option.
- **VoiceOver focus behind the sheet:** see [Accessibility](./accessibility).
- **Dragging runs on the JS thread:** swipe-to-close uses `PanResponder`. For gesture-handler-driven sheets, pass your own [`Sheet`](./customization#your-own-sheet).
