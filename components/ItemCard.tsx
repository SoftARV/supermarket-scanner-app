import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, ITEM_HEIGHT, spacing } from '../constants/theme';
import { ScannedItem } from '../types';
import { QuantityPicker } from './QuantityPicker';

interface Props {
  item: ScannedItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export const ItemCard = React.memo(function ItemCard({ item, onRemove, onUpdateQuantity }: Props) {
  const lineTotal = item.pricePerUnit * item.quantity;

  const handleRemove = useCallback(() => {
    Alert.alert('Remove item', `Remove "${item.name}" from list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onRemove(item.id);
        },
      },
    ]);
  }, [item.id, item.name, onRemove]);

  const handleQuantityChange = useCallback(
    (qty: number) => onUpdateQuantity(item.id, qty),
    [item.id, onUpdateQuantity],
  );

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || 'Unnamed item'}
        </Text>
        <Text style={styles.unitPrice}>€{item.pricePerUnit.toFixed(2)} / unit</Text>
      </View>
      <View style={styles.right}>
        <QuantityPicker quantity={item.quantity} onChangeQuantity={handleQuantityChange} />
        <Text style={styles.lineTotal}>€{lineTotal.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleRemove}
        accessibilityLabel={`Remove ${item.name}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  unitPrice: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  lineTotal: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: '700',
  },
});
