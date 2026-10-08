import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { BaseStyles } from '../theme/createStyles';
import type { PickerStrings } from '../theme/strings';
import type { PickerTokens } from '../theme/tokens';
import type { PickerStyles } from './types';

interface Props {
  loading: boolean;
  searching: boolean;
  query: string;
  clearSearch: () => void;
  base: BaseStyles;
  styles: Partial<PickerStyles>;
  strings: PickerStrings;
  tokens: PickerTokens;
}

/** Loading → searching → nothing found (with "clear search"). */
export function EmptyState({
  loading,
  searching,
  query,
  clearSearch,
  base,
  styles,
  strings,
  tokens,
}: Props) {
  if (loading || searching) {
    return (
      <View style={[base.empty, styles.empty]}>
        <ActivityIndicator color={tokens.colors.textMuted} />
        {searching && !loading ? (
          <Text style={[base.emptyText, base.emptyHint, styles.emptyText]}>
            {strings.searching}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[base.empty, styles.empty]}>
      <Text style={[base.emptyText, styles.emptyText]}>{strings.empty}</Text>
      {query ? (
        <Pressable
          onPress={clearSearch}
          accessibilityRole="button"
          style={base.emptyAction}
        >
          <Text style={base.emptyActionText}>{strings.clearSearch}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
