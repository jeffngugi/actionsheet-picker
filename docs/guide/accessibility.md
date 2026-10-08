# Accessibility

| Element | Announced as |
| --- | --- |
| Trigger | Button with the label and the current value (the placeholder when empty), plus an expanded or collapsed state |
| Option row | Button with a selected state |
| Multi-select row | Checkbox with a checked state |
| Group header | Header |
| Disabled row | Disabled |
| Close, clear search, remove chip | Labelled buttons (text from `strings`) |

- **No stale values.** A cleared field is announced with its placeholder, never with its old selection; Android otherwise keeps the old value.
- **Reduce motion.** The sheet skips its animations when the OS setting is on.
- **Alternatives to swiping.** Swipe-to-close always has ✕, backdrop and Android back alternatives.

::: info Known limitation
React Native's transparent `Modal` may let **VoiceOver** move focus to content behind the sheet on iOS. This hasn't been verified on a physical device yet. Reports are welcome on [GitHub issues](https://github.com/jeffngugi/actionsheet-picker/issues).
:::
