import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

export interface IconProps {
  color: string;
  size: number;
}

/** Downward chevron drawn from two borders of a rotated square. */
export const ChevronIcon = memo(function Chevron({ color, size }: IconProps) {
  const arm = Math.round(size * 0.5);
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View
        style={[
          styles.vee,
          { width: arm, height: arm, borderColor: color, marginTop: -arm / 2 },
        ]}
      />
    </View>
  );
});

export const CheckIcon = memo(function Check({ color, size }: IconProps) {
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View
        style={[
          styles.vee,
          {
            width: size * 0.35,
            height: size * 0.7,
            borderColor: color,
            marginTop: -size * 0.15,
          },
        ]}
      />
    </View>
  );
});

export const CloseIcon = memo(function Close({ color, size }: IconProps) {
  const bar = [styles.bar, { width: size, backgroundColor: color }];
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View style={[bar, styles.rotate45]} />
      <View style={[bar, styles.rotateMinus45]} />
    </View>
  );
});

export const SearchIcon = memo(function Search({ color, size }: IconProps) {
  const lens = size * 0.7;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.lens,
          {
            width: lens,
            height: lens,
            borderRadius: lens / 2,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.bar,
          styles.rotate45,
          {
            width: size * 0.4,
            backgroundColor: color,
            right: -size * 0.04,
            bottom: size * 0.12,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  vee: {
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  bar: { position: 'absolute', height: 2 },
  lens: { borderWidth: 2 },
  rotate45: { transform: [{ rotate: '45deg' }] },
  rotateMinus45: { transform: [{ rotate: '-45deg' }] },
});
