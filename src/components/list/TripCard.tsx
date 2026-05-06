import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BudgetBar } from '@/components/ui/BudgetBar';
import { useTheme, fontSizes, fonts, radius, spacing } from '@/theme';
import { type Trip } from '@/types';

interface Props {
  trip: Trip;
  onPress: () => void;
}

export const TripCard = React.memo(function TripCard({ trip, onPress }: Props) {
  const c = useTheme();

  const date = new Date(trip.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`Trip to ${trip.store}, ${date}`}
    >
      <Text style={[styles.store, { color: c.ink }]} numberOfLines={1}>
        {trip.store}
      </Text>
      <Text style={[styles.meta, { color: c.muted }]}>
        {date} · {trip.items.length} item{trip.items.length !== 1 ? 's' : ''}
      </Text>
      <Text style={[styles.total, { color: c.ink, fontFamily: fonts.serif }]}>
        €{trip.total.toFixed(2)}
      </Text>
      {trip.budget !== null && (
        <View style={styles.budgetBarWrapper}>
          <BudgetBar spent={trip.total} budget={trip.budget} hideLabels />
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  store: { fontSize: fontSizes.bodyLg, fontWeight: '600' },
  meta: { fontSize: fontSizes.caption },
  total: { fontSize: fontSizes.title, fontWeight: '500', marginTop: 2 },
  budgetBarWrapper: { marginTop: spacing.xs },
});
