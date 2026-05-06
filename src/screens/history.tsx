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

export default function HistoryScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { trips } = useAppContext();

  const monthTotal = trips.reduce((sum, t) => sum + t.total, 0);
  const monthLabel = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: c.ink, fontFamily: fonts.serif }]}>Trips</Text>
        {trips.length > 0 && (
          <Text style={[styles.monthSummary, { color: c.muted }]}>
            {monthLabel} · €{monthTotal.toFixed(2)} across {trips.length} trip{trips.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.body, trips.length === 0 && styles.bodyEmpty]}>
        {trips.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted }]}>
            No trips yet.{'\n'}Tap {'"'}Start trip{'"'} to begin.
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: c.accent }]}
          onPress={() => navigation.navigate('StartTrip')}
          accessibilityLabel="Start new trip"
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnLabel, { color: c.accentInk }]}>Start trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  title: { fontSize: fontSizes.large, fontWeight: '500' },
  monthSummary: { fontSize: fontSizes.caption },
  body: { padding: spacing.md, gap: spacing.sm },
  bodyEmpty: { flex: 1, justifyContent: 'center' },
  empty: { fontSize: fontSizes.body, textAlign: 'center', lineHeight: 24 },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  startBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnLabel: { fontSize: fontSizes.title, fontWeight: '700' },
});
