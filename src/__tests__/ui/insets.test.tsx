import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createContext } from 'react';
import { StyleSheet } from 'react-native';

// Simulate an app that has react-native-safe-area-context installed. The
// package isn't a dependency of this repo, hence `virtual`.
jest.mock(
  'react-native-safe-area-context',
  () => {
    const { createContext: create } =
      jest.requireActual<typeof import('react')>('react');
    return {
      SafeAreaInsetsContext: create(null),
      initialWindowMetrics: {
        insets: { top: 24, right: 0, bottom: 34, left: 0 },
        frame: { x: 0, y: 0, width: 390, height: 844 },
      },
    };
  },
  { virtual: true }
);

const { SafeAreaInsetsContext } = jest.requireMock<{
  SafeAreaInsetsContext: ReturnType<typeof createContext>;
}>('react-native-safe-area-context');
const { ActionSheetPicker } = jest.requireActual<
  typeof import('../../ui/ActionSheetPicker')
>('../../ui/ActionSheetPicker');

const items = [{ label: 'One', value: 1 }];
const instant = { motion: { durationIn: 0, durationOut: 0 } };
const sheetStyle = () =>
  StyleSheet.flatten(screen.getByTestId('p-sheet').props.style);

describe('safe-area insets (optional peer)', () => {
  it('uses initialWindowMetrics when there is no provider', async () => {
    await render(
      <ActionSheetPicker
        items={items}
        value={null}
        onChange={() => {}}
        tokens={instant}
        testID="p"
      />
    );
    await fireEvent.press(screen.getByTestId('p'));
    expect(sheetStyle().paddingBottom).toBe(34);
  });

  it('prefers the SafeAreaProvider context value', async () => {
    await render(
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, right: 0, bottom: 48, left: 0 }}
      >
        <ActionSheetPicker
          items={items}
          value={null}
          onChange={() => {}}
          tokens={instant}
          testID="p"
        />
      </SafeAreaInsetsContext.Provider>
    );
    await fireEvent.press(screen.getByTestId('p'));
    expect(sheetStyle().paddingBottom).toBe(48);
  });

  it('lets an explicit bottomInset win', async () => {
    await render(
      <ActionSheetPicker
        items={items}
        value={null}
        onChange={() => {}}
        tokens={instant}
        bottomInset={0}
        testID="p"
      />
    );
    await fireEvent.press(screen.getByTestId('p'));
    expect(sheetStyle().paddingBottom).toBe(0);
  });
});
