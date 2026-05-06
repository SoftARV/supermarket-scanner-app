import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripCard } from '@/components/list/TripCard';
import { useAppContext } from '@/context/AppContext';
import { useTheme, spacing, fontSizes, fonts, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'History'>;

function useMonthStats(trips: ReturnType<typeof useAppContext>['trips']) {
  const now = new Date();
  const thisMonth = trips.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const lastMonth = trips.filter((t) => {
    const d = new Date(t.createdAt);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
  });
  const thisTotal = thisMonth.reduce((s, t) => s + t.total, 0);
  const lastTotal = lastMonth.reduce((s, t) => s + t.total, 0);
  const pctChange = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : null;
  return { thisMonth, thisTotal, pctChange };
}

export default function HistoryScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { trips } = useAppContext();
  const { thisMonth, thisTotal, pctChange } = useMonthStats(trips);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }} />
          <Text style={[styles.trendIcon, { color: c.muted }]}>↗</Text>
        </View>
        <Text style={[styles.title, { color: c.ink, fontFamily: fonts.serif }]}>History</Text>
        {thisMonth.length > 0 && (
          <View style={styles.monthRow}>
            <Text style={[styles.monthLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>
              THIS MONTH
            </Text>
            <Text style={[styles.monthTotal, { color: c.ink, fontFamily: fonts.serif }]}>
              €{thisTotal.toFixed(2)}
            </Text>
            {pctChange !== null && (
              <Text
                style={[
                  styles.pctBadge,
                  { color: pctChange <= 0 ? c.accent : c.pop, fontFamily: fonts.sans600 },
                ]}
              >
                {pctChange <= 0 ? '↓' : '↑'} {Math.abs(pctChange)}% vs last
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Trip list */}
      <ScrollView contentContainerStyle={[styles.body, trips.length === 0 && styles.bodyEmpty]}>
        {trips.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted, fontFamily: fonts.sans }]}>
            No trips yet.{'\n'}Tap "Start a new trip" to begin.
          </Text>
        ) : (
          trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
            />
          ))
        )}
      </ScrollView>

      {/* CTA */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline },
        ]}
      >
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: c.accent }]}
          onPress={() => navigation.navigate('StartTrip')}
          accessibilityLabel="Start new trip"
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnLabel, { color: c.accentInk, fontFamily: fonts.sans700 }]}>
            + Start a new trip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md + spacing.sm,
    paddingBottom: spacing.md,
    gap: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  trendIcon: { fontSize: 18 },
  title: { fontSize: 32, fontWeight: '500', letterSpacing: -0.8, marginTop: 2 },
  monthRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: spacing.xs },
  monthLabel: { fontSize: fontSizes.caption, letterSpacing: 0.6 },
  monthTotal: { fontSize: 15, letterSpacing: -0.3 },
  pctBadge: { fontSize: fontSizes.caption, fontWeight: '500' },
  body: { padding: spacing.md - 2, gap: spacing.sm },
  bodyEmpty: { flex: 1, justifyContent: 'center' },
  empty: { fontSize: fontSizes.body, textAlign: 'center', lineHeight: 24 },
  footer: { padding: spacing.md, borderTopWidth: 1 },
  startBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnLabel: { fontSize: fontSizes.bodyLg, fontWeight: '600' },
});
