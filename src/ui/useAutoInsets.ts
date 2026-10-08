import { createContext, useContext, type Context } from 'react';

export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const ZERO: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

// `react-native-safe-area-context` is an optional peer dependency. A require
// inside try/catch is treated as optional by Metro (React Native's and Expo's
// default configs set `allowOptionalDependencies: true`) and by Jest, so apps
// without it still bundle and simply get zero insets.
let SafeAreaContext: Context<EdgeInsets | null> | null = null;
let initialInsets: EdgeInsets | null = null;
try {
  const safeArea = require('react-native-safe-area-context');
  SafeAreaContext = safeArea.SafeAreaInsetsContext ?? null;
  initialInsets = safeArea.initialWindowMetrics?.insets ?? null;
} catch {
  // Not installed.
}

const NoProvider = createContext<EdgeInsets | null>(null);

/**
 * Device insets (navigation bar, status bar, notch) when the app uses
 * `react-native-safe-area-context`; zero otherwise. Reads the provider's
 * context directly, so no `SafeAreaProvider` is required inside the modal.
 */
export function useAutoInsets(): EdgeInsets {
  const fromProvider = useContext(SafeAreaContext ?? NoProvider);
  return fromProvider ?? initialInsets ?? ZERO;
}
