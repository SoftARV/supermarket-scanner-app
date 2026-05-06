import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingList } from '@/components/list/ShoppingList';
import { BudgetBar } from '@/components/ui/BudgetBar';
import { LastAddedBadge } from '@/components/ui/LastAddedBadge';
import { TotalDisplay } from '@/components/ui/TotalDisplay';
import { useAppContext } from '@/context/AppContext';
import { useTheme, fontSizes, spacing, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ActiveList'>;

export default function ActiveListScreen() {
  const c = useTheme();
  const { activeTrip, removeItem, discardTrip } = useAppContext();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const items = activeTrip?.items ?? [];
  const total = activeTrip?.total ?? 0;

  const handleDiscard = useCallback(() => {
    Alert.alert('Discard trip', 'Remove all items and cancel this trip?', [
      { text: 'Keep shopping', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          discardTrip();
          navigation.navigate('History');
        },
      },
    ]);
  }, [discardTrip, navigation]);

  const handleFinish = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('FinishTrip');
  }, [navigation]);

  const handleScan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Camera');
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={handleDiscard} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.headerAction, { color: c.pop }]}>Discard</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.ink }]} numberOfLines={1}>
          {activeTrip?.store ?? 'Basket'}
        </Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.headerAction, { color: c.accent }]}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Hero total block */}
      <View style={[styles.hero, { backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
        <TotalDisplay total={total} size="xl" />
        {items.length > 0 && <LastAddedBadge item={items[items.length - 1]} />}
        {activeTrip?.budget != null && (
          <View style={styles.heroBudget}>
            <BudgetBar spent={total} budget={activeTrip.budget} />
          </View>
        )}
      </View>

      {/* Item list */}
      <ShoppingList items={items} onRemove={removeItem} />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: c.accent }]}
          onPress={handleScan}
          accessibilityLabel="Scan item"
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>📷</Text>
          <Text style={[styles.fabLabel, { color: c.accentInk }]}>Scan item</Text>
        </TouchableOpacity>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleFinish} style={styles.finishLink}>
            <Text style={[styles.finishLinkText, { color: c.muted }]}>Finish shopping →</Text>
          </TouchableOpacity>
        )}
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
  },
  headerTitle: { fontSize: fontSizes.title, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  headerAction: { fontSize: fontSizes.bodyLg, fontWeight: '600', minWidth: 52 },
  headerSpacer: { width: 52 },
  hero: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  heroBudget: { alignSelf: 'stretch' },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  fab: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fabIcon: { fontSize: 20 },
  fabLabel: { fontSize: fontSizes.title, fontWeight: '700' },
  finishLink: { alignItems: 'center', paddingVertical: spacing.xs },
  finishLinkText: { fontSize: fontSizes.body, fontWeight: '500' },
});
