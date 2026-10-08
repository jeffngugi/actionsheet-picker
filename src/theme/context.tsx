import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { useJsonStable, useShallowStable } from '../hook/stable';
import type { PickerIcons, PickerStyles, SheetProps } from '../ui/types';
import { defaultStrings, type PickerStrings } from './strings';
import {
  darkTokens,
  lightTokens,
  mergeTokens,
  type DeepPartial,
  type PickerTokens,
} from './tokens';

export interface PickerConfig {
  colorScheme?: 'auto' | 'light' | 'dark';
  /** Applied on top of the light/dark defaults. */
  tokens?: DeepPartial<PickerTokens>;
  /** Extra overrides used only in dark mode. */
  darkTokens?: DeepPartial<PickerTokens>;
  strings?: Partial<PickerStrings>;
  icons?: Partial<PickerIcons>;
  styles?: Partial<PickerStyles>;
  Sheet?: ComponentType<SheetProps>;
}

const PickerConfigContext = createContext<PickerConfig>({});

function mergeLoose(
  a: DeepPartial<PickerTokens> | undefined,
  b: DeepPartial<PickerTokens> | undefined
): DeepPartial<PickerTokens> | undefined {
  if (!a) return b;
  if (!b) return a;
  const out: Record<string, any> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = { ...(out[k] ?? {}), ...(v as object) };
  }
  return out;
}

/** Sets app-wide defaults for every picker below it. Props still win. */
export function PickerProvider({
  children,
  colorScheme,
  tokens,
  darkTokens: dark,
  strings,
  icons,
  styles,
  Sheet,
}: PickerConfig & { children: ReactNode }) {
  const parent = useContext(PickerConfigContext);
  const stableTokens = useJsonStable(tokens);
  const stableDark = useJsonStable(dark);
  const stableStrings = useShallowStable(strings);
  const stableIcons = useShallowStable(icons);
  const stableStyles = useShallowStable(styles);

  const value = useMemo<PickerConfig>(
    () => ({
      colorScheme: colorScheme ?? parent.colorScheme,
      tokens: mergeLoose(parent.tokens, stableTokens),
      darkTokens: mergeLoose(parent.darkTokens, stableDark),
      strings: { ...parent.strings, ...stableStrings },
      icons: { ...parent.icons, ...stableIcons },
      styles: { ...parent.styles, ...stableStyles },
      Sheet: Sheet ?? parent.Sheet,
    }),
    [
      parent,
      colorScheme,
      stableTokens,
      stableDark,
      stableStrings,
      stableIcons,
      stableStyles,
      Sheet,
    ]
  );

  return (
    <PickerConfigContext.Provider value={value}>
      {children}
    </PickerConfigContext.Provider>
  );
}

export function usePickerConfig(): PickerConfig {
  return useContext(PickerConfigContext);
}

export interface ResolvedTheme {
  scheme: 'light' | 'dark';
  tokens: PickerTokens;
  strings: PickerStrings;
  icons: Partial<PickerIcons>;
  styles: Partial<PickerStyles>;
  Sheet?: ComponentType<SheetProps>;
}

/** Merges defaults → provider → props. */
export function useResolvedTheme(props: {
  colorScheme?: 'auto' | 'light' | 'dark';
  tokens?: DeepPartial<PickerTokens>;
  strings?: Partial<PickerStrings>;
  icons?: Partial<PickerIcons>;
  styles?: Partial<PickerStyles>;
  Sheet?: ComponentType<SheetProps>;
}): ResolvedTheme {
  const config = usePickerConfig();
  const system = useColorScheme();
  const wanted = props.colorScheme ?? config.colorScheme ?? 'auto';
  const scheme: 'light' | 'dark' =
    wanted === 'auto' ? (system === 'dark' ? 'dark' : 'light') : wanted;

  // Inline `tokens={{ ... }}` must not rebuild styles on every render.
  const propTokens = useJsonStable(props.tokens);
  const propStrings = useShallowStable(props.strings);
  const propIcons = useShallowStable(props.icons);
  const propStyles = useShallowStable(props.styles);

  const tokens = useMemo(
    () =>
      scheme === 'dark'
        ? mergeTokens(darkTokens, config.tokens, config.darkTokens, propTokens)
        : mergeTokens(lightTokens, config.tokens, propTokens),
    [scheme, config.tokens, config.darkTokens, propTokens]
  );
  const strings = useMemo(
    () => ({ ...defaultStrings, ...config.strings, ...propStrings }),
    [config.strings, propStrings]
  );
  const icons = useMemo(
    () => ({ ...config.icons, ...propIcons }),
    [config.icons, propIcons]
  );
  const styles = useMemo(
    () => ({ ...config.styles, ...propStyles }),
    [config.styles, propStyles]
  );

  return {
    scheme,
    tokens,
    strings,
    icons,
    styles,
    Sheet: props.Sheet ?? config.Sheet,
  };
}
