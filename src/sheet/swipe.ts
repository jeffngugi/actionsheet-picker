import { createContext, useContext } from 'react';
import type { GestureResponderHandlers } from 'react-native';

/** Fraction of the sheet's height a drag must pass to close it. */
export const SWIPE_DISTANCE_RATIO = 0.25;
/** Release velocity (px/ms) that closes the sheet regardless of distance. */
export const SWIPE_VELOCITY = 0.8;
/** Movement before a touch on the drag area counts as a drag (not a tap). */
export const SWIPE_SLOP = 4;
/** How far the sheet may be pulled up past its resting position. */
const MAX_OVERDRAG = 24;

/** Whether a gesture should be claimed as a vertical sheet drag. */
export function isVerticalDrag(dx: number, dy: number): boolean {
  return Math.abs(dy) > SWIPE_SLOP && Math.abs(dy) > Math.abs(dx);
}

/** Sheet offset for a finger delta: follows downward, resists upward. */
export function dragOffset(dy: number): number {
  return dy >= 0 ? dy : Math.max(dy / 4, -MAX_OVERDRAG);
}

/** On release: close, or spring back to rest. */
export function shouldDismiss(
  dy: number,
  vy: number,
  sheetHeight: number
): boolean {
  if (dy <= 0) return false;
  return dy > sheetHeight * SWIPE_DISTANCE_RATIO || vy > SWIPE_VELOCITY;
}

/**
 * Drag handlers from the default sheet for content to spread on its own
 * drag area (the header). Empty when swipe is off or a custom sheet is used.
 */
export const SheetDragContext = createContext<GestureResponderHandlers | null>(
  null
);

export function useSheetDragHandlers(): GestureResponderHandlers | undefined {
  return useContext(SheetDragContext) ?? undefined;
}
