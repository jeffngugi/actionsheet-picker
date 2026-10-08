export interface PickerStrings {
  placeholder: string;
  /** Sheet title when no `title`/`label` is given. */
  title: string;
  searchPlaceholder: string;
  searching: string;
  empty: string;
  clearSearch: string;
  close: string;
  done: string;
  clearAll: string;
  loadingMore: string;
  /** Trigger text in multi `count` display. */
  selectedCount: (count: number) => string;
  /** Overflow suffix in multi `labels` display, e.g. "+3". */
  more: (count: number) => string;
  /** Accessibility label of a chip's remove button. */
  remove: (label: string) => string;
}

/** English defaults. Pass `strings` (prop or provider) to localise. */
export const defaultStrings: PickerStrings = {
  placeholder: 'Select an option',
  title: 'Select',
  searchPlaceholder: 'Search',
  searching: 'Searching…',
  empty: 'Nothing to show',
  clearSearch: 'Clear search',
  close: 'Close',
  done: 'Done',
  clearAll: 'Clear all',
  loadingMore: 'Loading more…',
  selectedCount: (count) => `${count} selected`,
  more: (count) => `+${count}`,
  remove: (label) => `Remove ${label}`,
};
