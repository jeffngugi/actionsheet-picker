export interface PickerTokens {
  colors: {
    /** Sheet and trigger background. */
    surface: string;
    /** Search field and subtle fills. */
    surfaceMuted: string;
    backdrop: string;
    text: string;
    textMuted: string;
    placeholder: string;
    border: string;
    divider: string;
    danger: string;
    accent: string;
    /** Text/icons drawn on `accent`. */
    onAccent: string;
    selectedBg: string;
    disabledBg: string;
    disabledText: string;
    handle: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radii: {
    input: number;
    sheet: number;
    checkbox: number;
    chip: number;
    button: number;
  };
  sizes: {
    inputHeight: number;
    rowHeight: number;
    childRowHeight: number;
    searchHeight: number;
    iconSize: number;
    checkboxSize: number;
    /** Max sheet height as a fraction of the screen (0–1). */
    sheetMaxHeight: number;
    childIndent: number;
  };
  typography: {
    /** `undefined` = platform font. */
    fontFamily?: string;
    fontFamilyBold?: string;
    label: number;
    input: number;
    row: number;
    title: number;
    caption: number;
  };
  motion: {
    /** ms; 0 disables the animation. */
    durationIn: number;
    durationOut: number;
  };
}

export const lightTokens: PickerTokens = {
  colors: {
    surface: '#FFFFFF',
    surfaceMuted: '#F2F2F7',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    text: '#1C1C1E',
    textMuted: '#6C6C70',
    placeholder: '#8E8E93',
    border: '#C7C7CC',
    divider: '#E5E5EA',
    danger: '#D93025',
    accent: '#007AFF',
    onAccent: '#FFFFFF',
    selectedBg: 'rgba(0, 122, 255, 0.08)',
    disabledBg: '#F2F2F7',
    disabledText: '#AEAEB2',
    handle: '#D1D1D6',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radii: { input: 8, sheet: 16, checkbox: 4, chip: 14, button: 8 },
  sizes: {
    inputHeight: 48,
    rowHeight: 48,
    childRowHeight: 44,
    searchHeight: 44,
    iconSize: 16,
    checkboxSize: 20,
    sheetMaxHeight: 0.8,
    childIndent: 16,
  },
  typography: { label: 14, input: 16, row: 16, title: 18, caption: 12 },
  motion: { durationIn: 250, durationOut: 200 },
};

export const darkTokens: PickerTokens = {
  ...lightTokens,
  colors: {
    surface: '#1C1C1E',
    surfaceMuted: '#2C2C2E',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    text: '#F2F2F7',
    textMuted: '#AEAEB2',
    placeholder: '#8E8E93',
    border: '#48484A',
    divider: '#38383A',
    danger: '#FF6B5E',
    accent: '#0A84FF',
    onAccent: '#FFFFFF',
    selectedBg: 'rgba(10, 132, 255, 0.18)',
    disabledBg: '#2C2C2E',
    disabledText: '#636366',
    handle: '#48484A',
  },
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Merges token overrides group by group (tokens are two levels deep). */
export function mergeTokens(
  base: PickerTokens,
  ...overrides: (DeepPartial<PickerTokens> | undefined)[]
): PickerTokens {
  const out = { ...base } as Record<string, any>;
  for (const override of overrides) {
    if (!override) continue;
    for (const [group, values] of Object.entries(override)) {
      if (values && typeof values === 'object') {
        out[group] = { ...out[group], ...values };
      }
    }
  }
  return out as PickerTokens;
}
