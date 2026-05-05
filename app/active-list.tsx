import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingList } from '../components/ShoppingList';
import { useTheme, fontSizes, spacing, touchTarget, radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ActiveList'>;

export default function ActiveListScreen() {
  const c = useTheme();
  const { activeTrip, removeItem, updateQuantity, discardTrip, finishTrip } = useAppContext();
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
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
        <TouchableOpacity onPress={handleDiscard} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.headerAction, { color: c.pop }]}>Discard</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.ink }]}>{activeTrip?.store ?? 'Basket'}</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.headerAction, { color: c.accent }]}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 52 }} />
        )}
      </View>

      <ShoppingList items={items} onRemove={removeItem} onUpdateQuantity={updateQuantity} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: c.muted }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: c.accent }]}>€{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: c.accent }]}
          onPress={handleScan}
          accessibilityLabel="Scan item"
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>📷</Text>
          <Text style={[styles.fabLabel, { color: c.accentInk }]}>Scan item</Text>
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
  headerTitle: { fontSize: fontSizes.title, fontWeight: '700' },
  headerAction: { fontSize: fontSizes.bodyLg, fontWeight: '600', minWidth: 52 },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: fontSizes.title, fontWeight: '600' },
  totalAmount: { fontSize: fontSizes.price, fontWeight: '800' },
  fab: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fabIcon: { fontSize: 22 },
  fabLabel: { fontSize: fontSizes.title, fontWeight: '700' },
});
