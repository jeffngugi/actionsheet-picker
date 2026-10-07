import { Text, View, StyleSheet } from 'react-native';

// Demo screens (basic, searchable, remote search, infinite, hierarchy,
// multiple, react-hook-form, themed, inside a modal, RTL) land in phase 3.
export default function App() {
  return (
    <View style={styles.container}>
      <Text>actionsheet-picker example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
