import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, spacing } from '../constants/theme';

export function SheetHandle() {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.handle, { backgroundColor: c.hairline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs },
  handle: { width: 36, height: 4, borderRadius: 2 },
});
