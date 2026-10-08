import { StyleSheet } from 'react-native';
import type { PickerTokens } from './tokens';

/** Base styles derived from tokens. Built once per token set. */
export function createStyles(t: PickerTokens) {
  const { colors: c, spacing: s, radii: r, sizes: z, typography: f } = t;
  const font = f.fontFamily ? { fontFamily: f.fontFamily } : null;
  const bold = f.fontFamilyBold
    ? { fontFamily: f.fontFamilyBold }
    : { fontWeight: '600' as const, ...font };

  return StyleSheet.create({
    container: { marginBottom: s.md },
    label: { fontSize: f.label, color: c.text, marginBottom: s.xs, ...font },
    requiredMark: { color: c.danger },
    trigger: {
      minHeight: z.inputHeight,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: r.input,
      backgroundColor: c.surface,
      paddingHorizontal: s.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    triggerError: { borderColor: c.danger },
    triggerDisabled: { backgroundColor: c.disabledBg },
    triggerBody: { flex: 1, paddingVertical: s.sm },
    triggerText: { fontSize: f.input, color: c.text, ...font },
    placeholder: { fontSize: f.input, color: c.placeholder, ...font },
    triggerAccessory: { marginLeft: s.sm },
    error: { fontSize: f.caption, color: c.danger, marginTop: s.xs, ...font },

    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: s.xs },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceMuted,
      borderRadius: r.chip,
      paddingLeft: s.sm + 2,
      paddingRight: s.xs,
      paddingVertical: 2,
    },
    chipText: { fontSize: f.caption + 1, color: c.text, ...font },
    chipRemove: { padding: s.xs, marginLeft: 2 },

    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: c.backdrop,
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: r.sheet,
      borderTopRightRadius: r.sheet,
      maxHeight: `${Math.round(z.sheetMaxHeight * 100)}%`,
      overflow: 'hidden',
    },
    sheetFixed: { height: `${Math.round(z.sheetMaxHeight * 100)}%` },
    sheetFullscreen: { flex: 1, maxHeight: '100%', borderRadius: 0 },
    // Taller than the visible bar so the drag area is easy to grab.
    handleArea: { alignItems: 'center', paddingTop: s.sm, paddingBottom: s.xs },
    handle: {
      width: 36,
      height: 5,
      borderRadius: 3,
      backgroundColor: c.handle,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s.lg,
      paddingTop: s.md,
      paddingBottom: s.sm,
    },
    title: { flex: 1, fontSize: f.title, color: c.text, ...bold },
    closeButton: { padding: s.sm, marginRight: -s.sm },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: z.searchHeight,
      marginHorizontal: s.lg,
      marginBottom: s.sm,
      paddingHorizontal: s.md,
      borderRadius: r.input,
      backgroundColor: c.surfaceMuted,
    },
    searchInput: {
      flex: 1,
      fontSize: f.input,
      color: c.text,
      paddingVertical: 0,
      marginHorizontal: s.sm,
      ...font,
    },

    list: { flexGrow: 0, flexShrink: 1 },
    // Longhands: an explicit flexGrow (from `list`) would override the `flex`
    // shorthand and collapse the list to zero height.
    listFill: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
    listContent: { paddingBottom: s.sm },
    row: {
      height: z.rowHeight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s.lg,
      backgroundColor: c.surface,
    },
    rowAuto: {
      height: undefined,
      minHeight: z.rowHeight,
      paddingVertical: s.sm,
    },
    childRow: { height: z.childRowHeight, paddingLeft: s.lg + z.childIndent },
    childRowAuto: { minHeight: z.childRowHeight },
    rowSelected: { backgroundColor: c.selectedBg },
    rowPressed: { opacity: 0.6 },
    rowText: { flex: 1, fontSize: f.row, color: c.text, ...font },
    rowTextSelected: { color: c.accent },
    rowTextDisabled: { color: c.disabledText },
    parentText: { color: c.textMuted, fontSize: f.caption + 1, ...bold },
    childText: { fontSize: f.row - 1 },
    rowAccessory: { marginLeft: s.sm },

    checkbox: {
      width: z.checkboxSize,
      height: z.checkboxSize,
      borderRadius: r.checkbox,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: c.accent, borderColor: c.accent },
    checkboxDisabled: { borderColor: c.disabledText, opacity: 0.5 },

    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s.xl * 2,
      paddingHorizontal: s.lg,
    },
    emptyText: {
      fontSize: f.row,
      color: c.textMuted,
      textAlign: 'center',
      ...font,
    },
    emptyHint: { marginTop: s.sm },
    emptyAction: { marginTop: s.md, padding: s.sm },
    emptyActionText: { fontSize: f.row, color: c.accent, ...bold },
    loadingMore: { paddingVertical: s.lg },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s.md,
      paddingHorizontal: s.lg,
      paddingTop: s.md,
      paddingBottom: s.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.divider,
    },
    footerButton: {
      paddingVertical: s.md,
      paddingHorizontal: s.lg,
      borderRadius: r.button,
    },
    footerButtonText: { fontSize: f.row, color: c.accent, ...bold },
    primaryButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: s.md,
      borderRadius: r.button,
      backgroundColor: c.accent,
    },
    primaryButtonText: { fontSize: f.row, color: c.onAccent, ...bold },
    disabledButton: { opacity: 0.4 },
  });
}

export type BaseStyles = ReturnType<typeof createStyles>;
