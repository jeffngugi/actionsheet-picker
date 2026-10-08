# Multi-select

Opt in with `multiple`. `value` is an array, and `onChange` receives `(values, items)`:

```tsx
<ActionSheetPicker
  multiple
  items={countries}
  value={codes}
  onChange={setCodes}
  min={1}
  max={3}
  onLimitReached={(limit) =>
    showToast(limit === 'max' ? 'Up to 3 countries' : 'Pick at least one')
  }
  multipleDisplay="chips" // 'labels' (default) · 'count' · 'chips'
/>
```

<div class="shots">
  <figure>
    <img src="/screenshots/ios-grouped-multi.png" alt="Multi-select sheet with checkboxes and Done button" />
    <figcaption>Picks are a draft until Done</figcaption>
  </figure>
  <figure>
    <img src="/screenshots/ios-chips.png" alt="Triggers showing selected labels and chips" />
    <figcaption>Labels and chips on the trigger</figcaption>
  </figure>
</div>

## Confirm modes

| `confirmMode` | Behaviour |
| --- | --- |
| `'done'` (default) | Picks are a draft until **Done**. Closing without Done discards them. |
| `'instant'` | Every tap calls `onChange`. |

## Trigger display

| `multipleDisplay` | Shows |
| --- | --- |
| `'labels'` (default) | "Kenya, Uganda, Tanzania +2" |
| `'count'` | "5 selected" (from `strings.selectedCount`) |
| `'chips'` | A removable chip per value |

**Clear all** in the sheet clears the draft. Chips can be removed straight from the trigger, which respects `min`.
