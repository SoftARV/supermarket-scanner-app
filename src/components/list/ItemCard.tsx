import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QuantityPicker } from '@/components/ui/QuantityPicker';
import { useTheme, fontSizes, ITEM_HEIGHT, spacing } from '@/theme';
import { type ScannedItem } from '@/types';

interface Props {
  item: ScannedItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export const ItemCard = React.memo(function ItemCard({ item, onRemove, onUpdateQuantity }: Props) {
  const c = useTheme();
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
    <View style={[styles.card, { backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.ink }]} numberOfLines={1}>
          {item.name || 'Unnamed item'}
        </Text>
        <Text style={[styles.unitPrice, { color: c.muted }]}>€{item.pricePerUnit.toFixed(2)} / unit</Text>
      </View>
      <View style={styles.right}>
        <QuantityPicker quantity={item.quantity} onChangeQuantity={handleQuantityChange} />
        <Text style={[styles.lineTotal, { color: c.accent }]}>€{lineTotal.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleRemove}
        accessibilityLabel={`Remove ${item.name}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.deleteText, { color: c.pop }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  info: { flex: 1, justifyContent: 'center', gap: 2 },
  name: { fontSize: fontSizes.body, fontWeight: '600' },
  unitPrice: { fontSize: fontSizes.caption },
  right: { alignItems: 'flex-end', gap: 4 },
  lineTotal: { fontSize: fontSizes.body, fontWeight: '700' },
  deleteButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 16, fontWeight: '700' },
});
