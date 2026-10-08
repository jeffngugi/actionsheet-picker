import { useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLatest } from '../hook/stable';
import { createStyles } from '../theme/createStyles';
import type { SheetProps } from '../ui/types';
import {
  SheetDragContext,
  dragOffset,
  isVerticalDrag,
  shouldDismiss,
} from './swipe';

const IOS_STATUS_BAR_FALLBACK = 44;

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => mounted && setReduce(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduce
    );
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, []);
  return reduce;
}

/**
 * Default bottom sheet: RN `Modal` + `Animated` only. Stays mounted until
 * the close animation finishes, then calls `onDismissed`.
 */
export function ModalSheet({
  visible,
  onRequestClose,
  onDismissed,
  children,
  tokens,
  styles: overrides,
  fixedHeight,
  bottomInset,
  topInset,
  presentation,
  modalProps,
  closeOnBackdropPress,
  swipeToClose = true,
  testID,
}: SheetProps) {
  const base = useMemo(() => createStyles(tokens), [tokens]);
  const { height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);
  const onDismissedRef = useLatest(onDismissed);

  const durationIn = reduceMotion ? 0 : tokens.motion.durationIn;
  const durationOut = reduceMotion ? 0 : tokens.motion.durationOut;

  // Android: lift content above the keyboard. Whether the modal window
  // resizes for the keyboard depends on the OS version and the app's
  // edge-to-edge setup, so instead of assuming either, compare the
  // keyboard's top edge with where the modal root actually ends on screen:
  // a resized window ends at the keyboard (no overlap), a full-screen one
  // ends under it. Both are screen coordinates (the modal is translucent,
  // so its window starts at the top of the screen).
  // iOS uses KeyboardAvoidingView.
  const rootRef = useRef<ElementRef<typeof View>>(null);
  const [root, setRoot] = useState<{ y: number; height: number } | null>(null);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return undefined;
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardTop(e.endCoordinates.screenY)
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardTop(null)
    );
    return () => {
      show.remove();
      hide.remove();
      setKeyboardTop(null);
    };
  }, [visible]);
  const measureRoot = () => {
    if (Platform.OS !== 'android') return;
    rootRef.current?.measureInWindow(
      (_x: number, y: number, _w: number, h: number) => {
        if (h > 0) setRoot({ y, height: h });
      }
    );
  };
  const keyboardUp = keyboardTop !== null;
  const rootHeight = root?.height ?? Dimensions.get('screen').height;
  const rootBottom = (root?.y ?? 0) + rootHeight;
  const keyboardOverlap = keyboardUp
    ? Math.max(0, rootBottom - keyboardTop)
    : 0;

  // iOS: KeyboardAvoidingView lifts the content; we only need to know the
  // keyboard is up to drop the home-indicator padding and let the sheet
  // grow. `will` events keep the layout change in step with the keyboard.
  const [iosKeyboardUp, setIosKeyboardUp] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios' || !visible) return undefined;
    const show = Keyboard.addListener('keyboardWillShow', () =>
      setIosKeyboardUp(true)
    );
    const hide = Keyboard.addListener('keyboardWillHide', () =>
      setIosKeyboardUp(false)
    );
    return () => {
      show.remove();
      hide.remove();
      setIosKeyboardUp(false);
    };
  }, [visible]);

  // ── swipe down to close (handle + header) ─────────────────────────────
  const dragY = useRef(new Animated.Value(0)).current;
  const sheetHeightRef = useRef(0);
  const onRequestCloseRef = useLatest(onRequestClose);
  const reduceMotionRef = useLatest(reduceMotion);
  const swipeEnabled = swipeToClose && presentation !== 'fullscreen';

  const draggingRef = useRef(false);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Claim on touch start. The responder system follows the React
        // tree, so a picker inside a ScrollView form has ancestors that
        // take over unclaimed touches before any move negotiation reaches
        // the header. Deeper touchables (the close button) still win
        // their own taps, and a tap that doesn't move simply settles back.
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => isVerticalDrag(g.dx, g.dy),
        onPanResponderGrant: () => {
          draggingRef.current = false;
        },
        onPanResponderMove: (_, g) => {
          if (!draggingRef.current) {
            if (!isVerticalDrag(g.dx, g.dy)) return;
            draggingRef.current = true;
            Keyboard.dismiss();
          }
          dragY.setValue(dragOffset(g.dy));
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, g) => {
          if (shouldDismiss(g.dy, g.vy, sheetHeightRef.current)) {
            onRequestCloseRef.current();
            return;
          }
          if (reduceMotionRef.current) {
            dragY.setValue(0);
            return;
          }
          Animated.spring(dragY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => dragY.setValue(0),
      }),
    [dragY, onRequestCloseRef, reduceMotionRef]
  );
  const dragHandlers = swipeEnabled ? panResponder.panHandlers : null;

  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      setMounted(true);
      if (durationIn <= 0) {
        progress.setValue(1);
        return undefined;
      }
      const anim = Animated.timing(progress, {
        toValue: 1,
        duration: durationIn,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      anim.start();
      return () => anim.stop();
    }

    const finish = () => {
      setMounted(false);
      onDismissedRef.current?.();
    };
    if (durationOut <= 0) {
      progress.setValue(0);
      finish();
      return undefined;
    }
    let cancelled = false;
    const anim = Animated.timing(progress, {
      toValue: 0,
      duration: durationOut,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished && !cancelled) finish();
    });
    return () => {
      cancelled = true;
      anim.stop();
    };
  }, [visible, durationIn, durationOut, progress, dragY, onDismissedRef]);

  if (!mounted && !visible) return null;

  const fullscreen = presentation === 'fullscreen';
  const translateY = Animated.add(
    progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }),
    dragY
  );
  // The modal draws under the status bar; fullscreen sheets clear it.
  const statusBar = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const paddingTop = fullscreen ? (topInset ?? statusBar ?? 0) : 0;
  // The keyboard covers the bottom inset area: on Android take whichever is
  // larger; on iOS (KeyboardAvoidingView already lifts us) drop the inset.
  const sheetLayout = {
    paddingBottom: iosKeyboardUp ? 0 : Math.max(bottomInset, keyboardOverlap),
    paddingTop,
  };
  // While the keyboard is up, the 80% cap would leave the list a row or two
  // between the header and the keyboard. Let the sheet use the full height
  // below the status bar instead; it drops back when the keyboard hides.
  // The root's height is used, not the screen's, because a resized window
  // already ends at the keyboard.
  let keyboardLayout = null;
  if (!fullscreen && keyboardUp) {
    const available = rootHeight - (statusBar ?? 0);
    keyboardLayout = fixedHeight
      ? { maxHeight: undefined, height: available }
      : { maxHeight: available };
  } else if (!fullscreen && iosKeyboardUp) {
    // Fill the area KeyboardAvoidingView leaves, below the safe-area top
    // (44 pt fallback when safe-area insets aren't available).
    keyboardLayout = {
      maxHeight: undefined,
      marginTop: topInset ?? IOS_STATUS_BAR_FALLBACK,
      flexShrink: 1,
      ...(fixedHeight ? { height: undefined, flexGrow: 1 } : null),
    };
  }

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      {...modalProps}
    >
      <View ref={rootRef} style={base.modalRoot} onLayout={measureRoot}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={base.modalRoot}
        >
          <Animated.View
            style={[base.backdrop, overrides.backdrop, { opacity: progress }]}
          >
            <Pressable
              style={base.modalRoot}
              onPress={closeOnBackdropPress ? onRequestClose : undefined}
              accessible={false}
              importantForAccessibility="no"
              testID={testID ? `${testID}-backdrop` : undefined}
            />
          </Animated.View>
          <Animated.View
            testID={testID ? `${testID}-sheet` : undefined}
            accessibilityViewIsModal
            onLayout={(e) => {
              sheetHeightRef.current = e.nativeEvent.layout.height;
            }}
            style={[
              base.sheet,
              fixedHeight && base.sheetFixed,
              fullscreen && base.sheetFullscreen,
              sheetLayout,
              keyboardLayout,
              { transform: [{ translateY }] },
              overrides.sheet,
            ]}
          >
            {!fullscreen ? (
              <View
                style={base.handleArea}
                testID={testID ? `${testID}-handle` : undefined}
                {...dragHandlers}
              >
                <View style={[base.handle, overrides.handle]} />
              </View>
            ) : null}
            <SheetDragContext.Provider value={dragHandlers}>
              {children}
            </SheetDragContext.Provider>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
