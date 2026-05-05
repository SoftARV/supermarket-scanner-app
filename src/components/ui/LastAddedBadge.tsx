import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, fontSizes, radius, spacing } from '@/theme';
import { ScannedItem } from '@/types';

interface Props {
  item: ScannedItem;
}

export function LastAddedBadge({ item }: Props) {
  const c = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
      <Text style={[styles.label, { color: c.accent }]}>Just added</Text>
      <Text style={[styles.name, { color: c.ink }]} numberOfLines={1}>
        {item.name || 'Item'}
      </Text>
      <Text style={[styles.price, { color: c.accent }]}>
        €{(item.pricePerUnit * item.quantity).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'center',
  },
  label: { fontSize: fontSizes.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  name: { fontSize: fontSizes.caption, fontWeight: '500', flexShrink: 1 },
  price: { fontSize: fontSizes.caption, fontWeight: '700' },
});
