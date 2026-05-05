import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TotalDisplay } from '@/components/ui/TotalDisplay';
import { useAppContext } from '@/context/AppContext';
import { useTheme, spacing, fontSizes, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FinishTrip'>;

export default function FinishTripScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { activeTrip, finishTrip } = useAppContext();

  const items = activeTrip?.items ?? [];
  const total = activeTrip?.total ?? 0;
  const budget = activeTrip?.budget ?? null;
  const overBudget = budget !== null && total > budget;

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    finishTrip();
    navigation.navigate('History');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.back, { color: c.accent }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.ink }]}>Trip summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.totalCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Text style={[styles.totalLabel, { color: c.muted }]}>Total spent</Text>
          <TotalDisplay total={total} size="lg" />
          {budget !== null && (
            <Text style={[styles.budgetLine, { color: overBudget ? c.pop : c.muted }]}>
              {overBudget
                ? `€${(total - budget).toFixed(2)} over budget`
                : `€${(budget - total).toFixed(2)} under budget`}
            </Text>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: c.muted }]}>{items.length} items</Text>
        {items.map((item) => (
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: c.accent }]}
          onPress={handleConfirm}
          accessibilityLabel="Save trip"
          activeOpacity={0.85}
        >
          <Text style={[styles.confirmBtnLabel, { color: c.accentInk }]}>Save trip</Text>
        </TouchableOpacity>
      </View>
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
  title: { fontSize: fontSizes.title, fontWeight: '700' },
  body: { padding: spacing.md, gap: spacing.sm },
  totalCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  totalLabel: { fontSize: fontSizes.body, fontWeight: '500' },
  budgetLine: { fontSize: fontSizes.body, fontWeight: '500' },
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
  footer: { padding: spacing.md, borderTopWidth: 1 },
  confirmBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnLabel: { fontSize: fontSizes.title, fontWeight: '700' },
});
