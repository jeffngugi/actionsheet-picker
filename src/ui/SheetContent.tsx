import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import type { Row as RowData } from '../core/types';
import type { PickerState } from '../hook/types';
import type { BaseStyles } from '../theme/createStyles';
import type { ResolvedTheme } from '../theme/context';
import { useSheetDragHandlers } from '../sheet/swipe';
import { EmptyState } from './EmptyState';
import { CloseIcon, SearchIcon } from './Icons';
import { Row } from './Row';
import type { PickerUIProps } from './types';

interface Props<T> {
  picker: PickerState<T>;
  ui: PickerUIProps<T>;
  theme: ResolvedTheme;
  base: BaseStyles;
  title: string;
  loading: boolean;
  /** Next page is loading (shows the list footer spinner). */
  loadingMore: boolean;
  /** List should fill the (fixed-height) sheet instead of fitting content. */
  fill: boolean;
  testID?: string;
}

/** Header, search field, list and (multi) footer inside the sheet. */
export function SheetContent<T>({
  picker,
  ui,
  theme,
  base,
  title,
  loading,
  loadingMore,
  fill,
  testID,
}: Props<T>) {
  const { tokens, strings, icons, styles } = theme;
  const fixedRowHeight = ui.fixedRowHeight ?? true;
  const { rows, selectedKeys, selectRow, isMultiple } = picker;

  // Fixed row heights let FlatList skip measuring (getItemLayout) and let
  // us open scrolled to the selection.
  const offsets = useMemo(() => {
    if (!fixedRowHeight) return null;
    const out = new Array<number>(rows.length + 1);
    out[0] = 0;
    rows.forEach((row, i) => {
      const h =
        row.depth === 1 ? tokens.sizes.childRowHeight : tokens.sizes.rowHeight;
      out[i + 1] = (out[i] as number) + h;
    });
    return out;
  }, [
    fixedRowHeight,
    rows,
    tokens.sizes.childRowHeight,
    tokens.sizes.rowHeight,
  ]);

  const getItemLayout = useMemo(
    () =>
      offsets
        ? (_: unknown, index: number) => ({
            index,
            offset: offsets[index] ?? 0,
            length: (offsets[index + 1] ?? 0) - (offsets[index] ?? 0),
          })
        : undefined,
    [offsets]
  );

  // Computed once per mount (the list mounts each time the sheet opens);
  // keeps a couple of rows of context above the selection.
  const [initialScrollIndex] = useState(() => {
    if (!offsets || ui.autoScrollToSelected === false) return undefined;
    const index = rows.findIndex((r) => selectedKeys.has(r.valueKey));
    return index > 2 ? index - 2 : undefined;
  });

  const stickyHeaderIndices = useMemo(() => {
    if (!ui.stickyHeaders) return undefined;
    const out: number[] = [];
    rows.forEach((r, i) => r.isParent && out.push(i));
    return out;
  }, [ui.stickyHeaders, rows]);

  const { itemTestID, renderItem: customRenderItem } = ui;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<RowData<T>>) => {
      const selected = selectedKeys.has(item.valueKey);
      if (customRenderItem) {
        return customRenderItem({
          row: item,
          selected,
          multiple: isMultiple,
          onPress: () => selectRow(item),
        });
      }
      const rowTestID =
        item.testID ??
        (typeof itemTestID === 'function' ? itemTestID(item) : itemTestID);
      return (
        <Row
          row={item}
          selected={selected}
          multiple={isMultiple}
          fixedHeight={fixedRowHeight}
          onSelect={selectRow}
          base={base}
          styles={styles}
          tokens={tokens}
          icons={icons}
          testID={rowTestID}
        />
      );
    },
    [
      selectedKeys,
      customRenderItem,
      isMultiple,
      selectRow,
      itemTestID,
      fixedRowHeight,
      base,
      styles,
      tokens,
      icons,
    ]
  );

  const dragHandlers = useSheetDragHandlers();

  // A new search shows its results from the top, not from wherever the
  // list was (e.g. scrolled to the selection on open).
  const listRef = useRef<FlatList<RowData<T>>>(null);
  const firstQuery = useRef(true);
  useEffect(() => {
    if (firstQuery.current) {
      firstQuery.current = false;
      return;
    }
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [picker.query]);
  const { setQuery } = picker;
  const clearSearch = useCallback(() => setQuery(''), [setQuery]);
  const emptyProps = {
    loading,
    searching: picker.searching,
    query: picker.query,
    clearSearch,
  };
  const empty = ui.renderEmpty ? (
    ui.renderEmpty(emptyProps)
  ) : (
    <EmptyState
      {...emptyProps}
      base={base}
      styles={styles}
      strings={strings}
      tokens={tokens}
    />
  );

  const footerSpinner =
    loadingMore && rows.length > 0 ? (
      <ActivityIndicator
        style={base.loadingMore}
        color={tokens.colors.textMuted}
        accessibilityLabel={strings.loadingMore}
      />
    ) : undefined;

  return (
    <>
      <View
        style={[base.header, styles.header]}
        testID={testID ? `${testID}-header` : undefined}
        {...dragHandlers}
      >
        <Text style={[base.title, styles.title]} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          onPress={picker.close}
          hitSlop={8}
          style={[base.closeButton, styles.closeButton]}
          accessibilityRole="button"
          accessibilityLabel={strings.close}
          testID={testID ? `${testID}-close` : undefined}
        >
          {icons.close ?? (
            <CloseIcon color={tokens.colors.textMuted} size={16} />
          )}
        </Pressable>
      </View>

      {picker.searchable ? (
        <View style={[base.searchContainer, styles.searchContainer]}>
          {icons.search ?? (
            <SearchIcon color={tokens.colors.placeholder} size={16} />
          )}
          <TextInput
            value={picker.query}
            onChangeText={picker.setQuery}
            placeholder={strings.searchPlaceholder}
            placeholderTextColor={tokens.colors.placeholder}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
            accessibilityLabel={strings.searchPlaceholder}
            testID={testID ? `${testID}-search` : undefined}
            {...ui.searchInputProps}
            style={[
              base.searchInput,
              styles.searchInput,
              ui.searchInputProps?.style,
            ]}
          />
          {picker.query ? (
            <Pressable
              onPress={clearSearch}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={strings.clearSearch}
            >
              <CloseIcon color={tokens.colors.placeholder} size={12} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={selectedKeys}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        stickyHeaderIndices={stickyHeaderIndices}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={picker.onEndReached}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={picker.onMomentumScrollBegin}
        ListEmptyComponent={empty}
        ListFooterComponent={footerSpinner}
        style={[base.list, fill && base.listFill, styles.list]}
        contentContainerStyle={[base.listContent, styles.listContent]}
        testID={testID ? `${testID}-list` : undefined}
        {...ui.listProps}
      />

      {isMultiple ? (
        <View style={[base.footer, styles.footer]}>
          {picker.draftCount > 0 ? (
            <Pressable
              onPress={picker.clear}
              accessibilityRole="button"
              style={[base.footerButton, styles.footerButton]}
              testID={testID ? `${testID}-clear` : undefined}
            >
              <Text style={[base.footerButtonText, styles.footerButtonText]}>
                {strings.clearAll}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={picker.requiresCommit ? picker.commit : picker.close}
            accessibilityRole="button"
            style={[base.primaryButton, styles.primaryButton]}
            testID={testID ? `${testID}-done` : undefined}
          >
            <Text style={[base.primaryButtonText, styles.primaryButtonText]}>
              {picker.draftCount > 0
                ? `${strings.done} (${picker.draftCount})`
                : strings.done}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

function keyExtractor<T>(row: RowData<T>) {
  return row.key;
}
