import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingList } from '../components/ShoppingList';
import { colors, fontSizes, spacing, touchTarget } from '../constants/theme';
import { useShoppingContext } from '../context/ShoppingContext';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const { items, total, removeItem, updateQuantity, clearList } = useShoppingContext();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const handleClear = useCallback(() => {
    Alert.alert('Clear list', 'Remove all items from your basket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearList();
        },
      },
    ]);
  }, [clearList]);

  const handleScan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Scanner');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Basket</Text>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear list"
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ShoppingList items={items} onRemove={removeItem} onUpdateQuantity={updateQuantity} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>€{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleScan}
          accessibilityLabel="Scan item"
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>📷</Text>
          <Text style={styles.fabLabel}>Scan item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.large,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clearText: {
    fontSize: fontSizes.body,
    color: colors.danger,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: fontSizes.title,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: fontSizes.price,
    fontWeight: '800',
    color: colors.total,
  },
  fab: {
    height: touchTarget.fab,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fabIcon: {
    fontSize: 24,
  },
  fabLabel: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.surface,
  },
});
