# Testing

## testIDs

`testID` goes on the trigger. The sheet parts use IDs derived from it:

| Element | testID |
| --- | --- |
| Trigger | `{testID}` |
| Sheet | `{testID}-sheet` |
| Backdrop | `{testID}-backdrop` |
| Grab handle | `{testID}-handle` |
| Header | `{testID}-header` |
| Close button | `{testID}-close` |
| Search field | `{testID}-search` |
| List | `{testID}-list` |
| Done / Clear all (multi) | `{testID}-done` / `{testID}-clear` |

Rows get `itemTestID`, either a string or `(row) => string`. An item's own `testID` field wins.

## Unit tests

Turn animations off so the sheet opens and closes synchronously:

```tsx
render(
  <ActionSheetPicker
    items={items}
    value={null}
    onChange={onChange}
    tokens={{ motion: { durationIn: 0, durationOut: 0 } }}
    testID="country"
  />
);

fireEvent.press(screen.getByTestId('country'));
fireEvent.press(screen.getByText('Kenya'));
expect(onChange).toHaveBeenCalledWith('KE', items[0]);
```

## End-to-end (Maestro, Detox)

```yaml
- tapOn:
    id: "country"
- tapOn: "Kenya"
- assertVisible: "Kenya"
```
