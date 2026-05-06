import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, fonts, fontSizes } from '@/theme';

interface Props {
  total: number;
  size?: 'md' | 'lg' | 'xl';
}

export function TotalDisplay({ total, size = 'lg' }: Props) {
  const c = useTheme();
  const [intPart, decPart] = total.toFixed(2).split('.');

  const heroSize =
    size === 'xl' ? fontSizes.hero2 : size === 'lg' ? fontSizes.hero : fontSizes.price;
  const smallSize =
    size === 'xl' || size === 'lg' ? fontSizes.large : fontSizes.bodyLg;

  return (
    <View style={styles.row}>
      <Text style={[styles.symbol, { color: c.muted, fontSize: smallSize, fontFamily: fonts.serif }]}>
        €
      </Text>
      <Text style={[styles.integer, { color: c.ink, fontSize: heroSize, fontFamily: fonts.serif }]}>
        {intPart}
      </Text>
      <Text style={[styles.cents, { color: c.muted, fontSize: smallSize, fontFamily: fonts.serif }]}>
        .{decPart}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  symbol: { fontWeight: '500', paddingBottom: 6 },
  integer: { fontWeight: '500' },
  cents: { fontWeight: '500', paddingBottom: 8 },
});
