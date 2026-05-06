import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, fonts, radius, spacing } from '@/theme';
import { type ScannedItem } from '@/types';

interface Props {
  item: ScannedItem;
}

export function LastAddedBadge({ item }: Props) {
  const c = useTheme();
  const lineTotal = item.pricePerUnit * item.quantity;
  const label = `+ €${lineTotal.toFixed(2)} ${item.name || 'Item'}`;

  return (
    <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
      <View style={[styles.circle, { backgroundColor: c.accent }]}>
        <Text style={[styles.check, { color: c.accentInk }]}>✓</Text>
      </View>
      <Text style={[styles.label, { color: c.accent, fontFamily: fonts.sans600 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 11, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600' },
});
