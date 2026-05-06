import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, fonts, radius, spacing } from '@/theme';
import { type Trip } from '@/types';

interface Props {
  trip: Trip;
  onPress: () => void;
}

export const TripCard = React.memo(function TripCard({ trip, onPress }: Props) {
  const c = useTheme();

  const date = new Date(trip.createdAt).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const over = trip.budget !== null && trip.total > trip.budget;
  const budgetDelta =
    trip.budget !== null
      ? over
        ? `€${(trip.total - trip.budget).toFixed(2)} over`
        : `€${(trip.budget - trip.total).toFixed(2)} under`
      : null;
  const budgetPct = trip.budget !== null ? Math.min(1, trip.total / trip.budget) : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`Trip to ${trip.store}, ${date}`}
    >
      <View style={styles.left}>
        <Text style={[styles.date, { color: c.ink, fontFamily: fonts.sans600 }]}>{date}</Text>
        <Text style={[styles.store, { color: c.muted, fontFamily: fonts.sans }]} numberOfLines={1}>
          {trip.store}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: c.muted, fontFamily: fonts.sans }]}>
            {trip.items.length} item{trip.items.length !== 1 ? 's' : ''}
          </Text>
          {budgetDelta && (
            <>
              <View style={[styles.dot, { backgroundColor: c.muted }]} />
              <Text
                style={[
                  styles.metaText,
                  { color: over ? c.pop : c.muted, fontFamily: over ? fonts.sans600 : fonts.sans },
                ]}
              >
                {budgetDelta}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.total, { color: c.ink, fontFamily: fonts.serif }]}>
          €{trip.total.toFixed(2)}
        </Text>
        {trip.budget !== null && (
          <View style={[styles.miniTrack, { backgroundColor: c.surface2 }]}>
            <View
              style={[
                styles.miniFill,
                { width: `${budgetPct * 100}%`, backgroundColor: over ? c.pop : c.accent },
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.md - 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  left: { flex: 1, gap: 2 },
  date: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },
  store: { fontSize: 11.5, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 10.5 },
  dot: { width: 2, height: 2, borderRadius: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  total: { fontSize: 19, fontWeight: '500', letterSpacing: -0.5 },
  miniTrack: { width: 56, height: 3, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: '100%' },
});
