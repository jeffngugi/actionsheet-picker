import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { dragOffset, isVerticalDrag, shouldDismiss } from '../../sheet/swipe';
import { ActionSheetPicker } from '../../ui/ActionSheetPicker';

describe('swipe rules', () => {
  it('only claims mostly-vertical moves beyond the slop', () => {
    expect(isVerticalDrag(0, 3)).toBe(false); // a tap jitter
    expect(isVerticalDrag(0, 10)).toBe(true);
    expect(isVerticalDrag(20, 10)).toBe(false); // horizontal
    expect(isVerticalDrag(0, -10)).toBe(true); // claimed, but resisted
  });

  it('follows the finger down and resists pulling up', () => {
    expect(dragOffset(120)).toBe(120);
    expect(dragOffset(-40)).toBe(-10);
    expect(dragOffset(-400)).toBe(-24);
  });

  it('closes past a quarter of the height or on a fast flick', () => {
    expect(shouldDismiss(150, 0.1, 400)).toBe(true);
    expect(shouldDismiss(60, 0.1, 400)).toBe(false);
    expect(shouldDismiss(60, 1.2, 400)).toBe(true);
    expect(shouldDismiss(-50, 2, 400)).toBe(false);
  });
});

// ── simulated drag through the real PanResponder handlers ──────────────
type Point = { y: number; t: number };

function touchEvent(start: Point, current: Point, previous: Point) {
  const touch = {
    touchActive: true,
    startPageX: 100,
    startPageY: start.y,
    startTimeStamp: start.t,
    currentPageX: 100,
    currentPageY: current.y,
    currentTimeStamp: current.t,
    previousPageX: 100,
    previousPageY: previous.y,
    previousTimeStamp: previous.t,
  };
  return {
    nativeEvent: {
      pageX: 100,
      pageY: current.y,
      touches: [{}],
      changedTouches: [{}],
    },
    touchHistory: {
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: current.t,
      touchBank: [touch],
    },
  };
}

/** Drags `element` down by `distance` px over `ms` milliseconds. */
async function drag(element: any, distance: number, ms: number) {
  const start = { y: 100, t: 1000 };
  const mid = { y: 100 + distance / 2, t: 1000 + ms / 2 };
  const end = { y: 100 + distance, t: 1000 + ms };
  const { props } = element;
  // Same order as RN's responder system: capture phase updates the
  // gesture state, then the bubble-phase "should set" decides.
  await act(() => {
    props.onStartShouldSetResponderCapture(touchEvent(start, start, start));
    props.onMoveShouldSetResponderCapture(touchEvent(start, mid, start));
    const claimed = props.onMoveShouldSetResponder(
      touchEvent(start, mid, start)
    );
    expect(claimed).toBe(true);
    props.onResponderGrant(touchEvent(start, mid, start));
    props.onResponderMove(touchEvent(start, end, mid));
    props.onResponderRelease(touchEvent(start, end, end));
  });
}

const instant = { motion: { durationIn: 0, durationOut: 0 } };
const items = [
  { label: 'Kenya', value: 'KE' },
  { label: 'Uganda', value: 'UG' },
];

function Picker(props: { swipeToClose?: boolean; onClose?: () => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <ActionSheetPicker
      items={items}
      value={value}
      onChange={setValue}
      tokens={instant}
      testID="p"
      {...props}
    />
  );
}

async function openSheet() {
  await fireEvent.press(screen.getByTestId('p'));
}

describe('swipe to close', () => {
  it('closes after a long drag on the header', async () => {
    const onClose = jest.fn();
    await render(<Picker onClose={onClose} />);
    await openSheet();
    // Unmeasured sheet (height 0): a slow drag closes on distance alone.
    await drag(screen.getByTestId('p-header'), 200, 2000);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('p-sheet')).toBeNull();
  });

  it('springs back after a short slow drag on a measured sheet', async () => {
    const onClose = jest.fn();
    await render(<Picker onClose={onClose} />);
    await openSheet();
    await fireEvent(screen.getByTestId('p-sheet'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 400 } },
    });
    await drag(screen.getByTestId('p-header'), 40, 2000); // 10%, slow
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('p-sheet')).toBeTruthy();
  });

  it('closes on a short fast flick', async () => {
    const onClose = jest.fn();
    await render(<Picker onClose={onClose} />);
    await openSheet();
    await fireEvent(screen.getByTestId('p-sheet'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 400 } },
    });
    await drag(screen.getByTestId('p-header'), 40, 20); // 2 px/ms
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes after a drag on the handle', async () => {
    const onClose = jest.fn();
    await render(<Picker onClose={onClose} />);
    await openSheet();
    await drag(screen.getByTestId('p-handle'), 200, 2000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has no drag handlers when swipeToClose is false', async () => {
    await render(<Picker swipeToClose={false} />);
    await openSheet();
    expect(
      screen.getByTestId('p-header').props.onMoveShouldSetResponder
    ).toBeUndefined();
    expect(
      screen.getByTestId('p-handle').props.onMoveShouldSetResponder
    ).toBeUndefined();
  });

  it('leaves the close button tappable inside the drag area', async () => {
    const onClose = jest.fn();
    await render(<Picker onClose={onClose} />);
    await openSheet();
    await fireEvent.press(screen.getByTestId('p-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
