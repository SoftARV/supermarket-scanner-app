import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, fontSizes, fonts, radius, spacing } from '@/theme';

interface Props {
  spent: number;
  budget: number;
  hideLabels?: boolean;
}

export function BudgetBar({ spent, budget, hideLabels = false }: Props) {
  const c = useTheme();
  const ratio = Math.min(spent / budget, 1);
  const over = spent > budget;
  const fillColor = over ? c.pop : c.accent;
  const remaining = budget - spent;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: c.surface2 }]}>
        <View style={[styles.fill, { backgroundColor: fillColor, width: `${ratio * 100}%` }]} />
      </View>
      {!hideLabels && (
        <View style={styles.labels}>
          <Text style={[styles.label, { color: c.muted, fontFamily: fonts.sans }]}>
            €{spent.toFixed(2)} spent
          </Text>
          <Text style={[styles.label, { color: over ? c.pop : c.muted, fontFamily: fonts.sans }]}>
            {over
              ? `€${Math.abs(remaining).toFixed(2)} over`
              : `€${remaining.toFixed(2)} left`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: fontSizes.caption },
});
