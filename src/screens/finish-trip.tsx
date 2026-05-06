import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Check, ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TotalDisplay } from '@/components/ui/TotalDisplay';
import { useAppContext } from '@/context/AppContext';
import { useTheme, spacing, fontSizes, fonts, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FinishTrip'>;

export default function FinishTripScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { activeTrip, finishTrip, discardTrip } = useAppContext();

  const items = activeTrip?.items ?? [];
  const total = activeTrip?.total ?? 0;
  const budget = activeTrip?.budget ?? null;
  const store = activeTrip?.store ?? '';
  const over = budget !== null && total > budget;
  const budgetDelta = budget !== null ? Math.abs(budget - total) : null;
  const budgetPct = budget !== null ? Math.min(1, total / budget) : 0;

  const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    finishTrip();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'History' }] }));
  };

  const handleKeepScanning = () => {
    navigation.goBack();
  };

  const handleDiscard = () => {
    Alert.alert('Discard trip', 'This will delete all scanned items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          discardTrip();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'History' }] }));
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Nav bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity
          style={styles.navLeft}
          onPress={handleKeepScanning}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color={c.muted} strokeWidth={1.8} />
          <Text style={[styles.navBackLabel, { color: c.muted, fontFamily: fonts.sans500 }]}>Keep adding</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: c.muted, fontFamily: fonts.sans500 }]}>Finish trip</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: spacing.md }]}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.checkCircle, { backgroundColor: c.accentSoft, borderColor: c.hairline }]}>
            <Check size={28} color={c.accent} strokeWidth={2.0} />
          </View>
          <Text style={[styles.heroTitle, { color: c.ink, fontFamily: fonts.serif }]}>Trip complete</Text>
          <Text style={[styles.heroSub, { color: c.muted, fontFamily: fonts.sans }]}>
            {store} · {time}
          </Text>
        </View>

        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <View style={styles.summaryTop}>
            <Text style={[styles.summaryLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>TOTAL</Text>
            <TotalDisplay total={total} size="md" />
          </View>

          {budget !== null && (
            <View style={[styles.budgetTrack, { backgroundColor: c.surface2 }]}>
              <View
                style={[
                  styles.budgetFill,
                  { width: `${budgetPct * 100}%`, backgroundColor: over ? c.pop : c.accent },
                ]}
              />
            </View>
          )}

          <View style={[styles.statsRows, { borderTopColor: c.hairline }]}>
            <View style={styles.statsRow}>
              <Text style={[styles.statsKey, { color: c.muted, fontFamily: fonts.sans }]}>Items scanned</Text>
              <Text style={[styles.statsVal, { color: c.ink, fontFamily: fonts.serif }]}>{items.length}</Text>
            </View>
            {budget !== null && (
              <>
                <View style={styles.statsRow}>
                  <Text style={[styles.statsKey, { color: c.muted, fontFamily: fonts.sans }]}>Budget</Text>
                  <Text style={[styles.statsVal, { color: c.ink, fontFamily: fonts.serif }]}>€{budget.toFixed(2)}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={[styles.statsKey, { color: c.muted, fontFamily: fonts.sans }]}>
                    {over ? 'Over budget' : 'Under budget'}
                  </Text>
                  <View style={styles.budgetDeltaRow}>
                    {!over && <Check size={12} color={c.accent} strokeWidth={2.0} />}
                    <Text style={[styles.statsVal, { color: over ? c.pop : c.accent, fontFamily: fonts.serif }]}>
                      €{budgetDelta?.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: c.surface,
            borderTopColor: c.hairline,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: c.accent }]}
          onPress={handleConfirm}
          accessibilityLabel="Save and finish trip"
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnLabel, { color: c.accentInk, fontFamily: fonts.sans700 }]}>
            Save &amp; finish
          </Text>
        </TouchableOpacity>
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: c.hairline }]}
            onPress={handleKeepScanning}
          >
            <Text style={[styles.secondaryBtnLabel, { color: c.ink, fontFamily: fonts.sans600 }]}>
              Keep scanning
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: c.hairline }]}
            onPress={handleDiscard}
          >
            <Text style={[styles.secondaryBtnLabel, { color: c.pop, fontFamily: fonts.sans600 }]}>
              Discard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
  navBackLabel: { fontSize: 14 },
  navTitle: { fontSize: 13, letterSpacing: -0.1, flex: 1, textAlign: 'center' },
  navSpacer: { flex: 1 },

  body: { padding: spacing.md, gap: spacing.md, paddingTop: spacing.xs },

  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  budgetDeltaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heroTitle: { fontSize: 28, fontWeight: '500', letterSpacing: -0.6 },
  heroSub: { fontSize: 12, marginTop: -2 },

  summaryCard: {
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryTop: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: fontSizes.caption, fontWeight: '600', letterSpacing: 0.6 },
  budgetTrack: {
    height: 6,
    marginHorizontal: spacing.md,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  budgetFill: { height: '100%' },
  statsRows: {
    borderTopWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statsKey: { fontSize: 13 },
  statsVal: { fontSize: 14, fontWeight: '500' },

  footer: { padding: spacing.md, borderTopWidth: 1, gap: spacing.sm },
  saveBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnLabel: { fontSize: fontSizes.bodyLg, fontWeight: '700' },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnLabel: { fontSize: fontSizes.body, fontWeight: '600' },
});
