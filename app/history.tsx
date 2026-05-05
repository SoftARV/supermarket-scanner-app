import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, spacing, fontSizes, touchTarget, radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'History'>;

export default function HistoryScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { trips } = useAppContext();

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
        <Text style={[styles.title, { color: c.ink }]}>Trips</Text>
      </View>

      <View style={styles.body}>
        {trips.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted }]}>No trips yet</Text>
        ) : (
          trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[styles.tripRow, { backgroundColor: c.surface, borderColor: c.hairline }]}
              onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
            >
              <Text style={[styles.tripStore, { color: c.ink }]}>{trip.store}</Text>
              <Text style={[styles.tripTotal, { color: c.accent }]}>€{trip.total.toFixed(2)}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

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
    borderBottomWidth: 1,
  },
  title: { fontSize: fontSizes.large, fontWeight: '700' },
  body: { flex: 1, padding: spacing.md, gap: spacing.sm },
  empty: { fontSize: fontSizes.body, textAlign: 'center', marginTop: spacing.xl },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tripStore: { fontSize: fontSizes.bodyLg, fontWeight: '600' },
  tripTotal: { fontSize: fontSizes.bodyLg, fontWeight: '700' },
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
