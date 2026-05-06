import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TotalDisplay } from '@/components/ui/TotalDisplay';
import { useAppContext } from '@/context/AppContext';
import { useTheme, spacing, fontSizes, fonts, radius, touchTarget } from '@/theme';
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
        <Text style={[styles.notFound, { color: c.muted, fontFamily: fonts.sans }]}>Trip not found</Text>
      </View>
    );
  }

  const completedAt = trip.completedAt ?? trip.createdAt;
  const dateStr = new Date(completedAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = new Date(completedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const over = trip.budget !== null && trip.total > trip.budget;
  const budgetDelta = trip.budget !== null
    ? over
      ? `€${(trip.total - trip.budget).toFixed(2)} over`
      : `€${(trip.budget - trip.total).toFixed(2)} under`
    : null;
  const budgetPct = trip.budget !== null ? Math.min(1, trip.total / trip.budget) : 0;

  const handleMore = () => {
    Alert.alert(trip.store, undefined, [
      { text: 'Share', onPress: () => {} },
      { text: 'Reuse list', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Nav bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity
          style={styles.navLeft}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.navBack, { color: c.muted, fontFamily: fonts.sans500 }]}>‹</Text>
          <Text style={[styles.navBackLabel, { color: c.muted, fontFamily: fonts.sans500 }]}>History</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: c.muted, fontFamily: fonts.sans500 }]}>Past trip</Text>
        <TouchableOpacity
          style={styles.navRight}
          onPress={handleMore}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.moreBtn, { color: c.muted }]}>···</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        {/* Header block */}
        <View style={styles.headerBlock}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: c.muted }]} />
            <Text style={[styles.statusLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>
              COMPLETED · {dateStr.toUpperCase()}, {timeStr}
            </Text>
          </View>
          <Text style={[styles.storeName, { color: c.ink, fontFamily: fonts.serif }]}>
            {trip.store}
          </Text>

          {/* Total + budget */}
          <View style={styles.totalRow}>
            <TotalDisplay total={trip.total} size="lg" />
            {trip.budget !== null && (
              <View style={styles.budgetBlock}>
                <Text style={[styles.budgetLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>BUDGET</Text>
                <Text style={[styles.budgetAmount, { color: c.ink, fontFamily: fonts.serif }]}>
                  €{trip.budget.toFixed(2)}
                </Text>
                {budgetDelta && (
                  <Text style={[styles.budgetDelta, { color: over ? c.pop : c.accent, fontFamily: fonts.sans600 }]}>
                    {budgetDelta}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Budget bar */}
          {trip.budget !== null && (
            <View style={[styles.budgetTrack, { backgroundColor: c.surface2 }]}>
              <View
                style={[
                  styles.budgetFill,
                  { width: `${budgetPct * 100}%`, backgroundColor: over ? c.pop : c.accent },
                ]}
              />
            </View>
          )}
        </View>

        {/* Items */}
        <Text style={[styles.itemsLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>
          {trip.items.length} ITEMS
        </Text>
        <View style={[styles.itemsCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          {trip.items.map((item, i) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                { borderBottomColor: c.hairline, borderBottomWidth: i < trip.items.length - 1 ? 1 : 0 },
              ]}
            >
              <View style={[styles.qtyBadge, { backgroundColor: c.surface2 }]}>
                <Text style={[styles.qtyText, { color: c.muted, fontFamily: fonts.sans600 }]}>
                  ×{item.quantity}
                </Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: c.ink, fontFamily: fonts.sans600 }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemMeta, { color: c.muted, fontFamily: fonts.sans }]}>
                  €{item.pricePerUnit.toFixed(2)} / unit
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: c.ink, fontFamily: fonts.serif }]}>
                €{(item.pricePerUnit * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: c.hairline }]}
            onPress={() => {}}
            activeOpacity={0.75}
          >
            <Text style={[styles.actionBtnLabel, { color: c.ink, fontFamily: fonts.sans600 }]}>↑ Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: c.hairline, backgroundColor: c.surface }]}
            onPress={() => {}}
            activeOpacity={0.75}
          >
            <Text style={[styles.actionBtnLabel, { color: c.ink, fontFamily: fonts.sans600 }]}>☰ Reuse list</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { textAlign: 'center', marginTop: spacing.xl, fontSize: fontSizes.body },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
  navBack: { fontSize: 22, lineHeight: 24 },
  navBackLabel: { fontSize: 14 },
  navTitle: { fontSize: 13, letterSpacing: -0.1, flex: 1, textAlign: 'center' },
  navRight: { flex: 1, alignItems: 'flex-end' },
  moreBtn: { fontSize: 18, letterSpacing: 2 },

  body: { padding: spacing.md, gap: spacing.md },

  headerBlock: {
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  storeName: { fontSize: 24, fontWeight: '500', letterSpacing: -0.5, marginTop: 4 },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  budgetBlock: { alignItems: 'flex-end', gap: 2 },
  budgetLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  budgetAmount: { fontSize: 18, fontWeight: '500' },
  budgetDelta: { fontSize: 11, fontWeight: '600' },

  budgetTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: spacing.sm },
  budgetFill: { height: '100%' },

  itemsLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.sm,
  },
  itemsCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md - 4,
    minHeight: 60,
  },
  qtyBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14.5, fontWeight: '600', letterSpacing: -0.1 },
  itemMeta: { fontSize: 11 },
  itemTotal: { fontSize: 16, fontWeight: '500', letterSpacing: -0.3 },

  bottomActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: {
    flex: 1,
    height: touchTarget.min - 4,
    borderRadius: radius.full,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLabel: { fontSize: fontSizes.body, fontWeight: '600' },
});
