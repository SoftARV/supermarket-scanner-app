import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TotalDisplay } from '@/components/ui/TotalDisplay';
import { useAppContext } from '@/context/AppContext';
import { useTheme, spacing, fontSizes, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'TripDetail'>;

export default function TripDetailScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { trips } = useAppContext();

  const trip = trips.find((t) => t.id === route.params.tripId);

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.notFound, { color: c.muted }]}>Trip not found</Text>
      </View>
    );
  }

  const date = new Date(trip.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.back, { color: c.accent }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.ink }]} numberOfLines={1}>{trip.store}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.totalCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Text style={[styles.dateText, { color: c.muted }]}>{date}</Text>
          <TotalDisplay total={trip.total} size="lg" />
          {trip.budget !== null && (
            <Text style={[styles.budgetLine, { color: c.muted }]}>
              Budget: €{trip.budget.toFixed(2)}
            </Text>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: c.muted }]}>{trip.items.length} items</Text>
        {trip.items.map((item) => (
          <View key={item.id} style={[styles.itemRow, { backgroundColor: c.surface, borderColor: c.hairline }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: c.ink }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.itemMeta, { color: c.muted }]}>
                {item.quantity} × €{item.pricePerUnit.toFixed(2)}
              </Text>
            </View>
            <Text style={[styles.itemTotal, { color: c.ink }]}>
              €{(item.pricePerUnit * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  back: { fontSize: fontSizes.bodyLg, fontWeight: '500' },
  headerSpacer: { width: 52 },
  title: { fontSize: fontSizes.title, fontWeight: '700', flex: 1, textAlign: 'center' },
  body: { padding: spacing.md, gap: spacing.sm },
  notFound: { textAlign: 'center', marginTop: spacing.xl, fontSize: fontSizes.body },
  totalCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  dateText: { fontSize: fontSizes.caption },
  budgetLine: { fontSize: fontSizes.body },
  sectionLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: fontSizes.bodyLg, fontWeight: '600' },
  itemMeta: { fontSize: fontSizes.caption },
  itemTotal: { fontSize: fontSizes.bodyLg, fontWeight: '700', marginLeft: spacing.sm },
});
