import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme, fontSizes, ITEM_HEIGHT, spacing } from '../constants/theme';
import { ScannedItem } from '../types';
import { ItemCard } from './ItemCard';

interface Props {
  items: ScannedItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const EmptyState = React.memo(function EmptyState() {
  const c = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={[styles.emptyTitle, { color: c.ink }]}>Your basket is empty</Text>
      <Text style={[styles.emptySubtitle, { color: c.muted }]}>Tap the scan button to add items</Text>
    </View>
  );
});

export const ShoppingList = React.memo(function ShoppingList({
  items,
  onRemove,
  onUpdateQuantity,
}: Props) {
  const renderItem = useCallback(
    ({ item }: { item: ScannedItem }) => (
      <ItemCard item={item} onRemove={onRemove} onUpdateQuantity={onUpdateQuantity} />
    ),
    [onRemove, onUpdateQuantity],
  );

  const keyExtractor = useCallback((item: ScannedItem) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<ScannedItem> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={EmptyState}
      removeClippedSubviews
      maxToRenderPerBatch={12}
      windowSize={5}
      initialNumToRender={12}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
    />
  );
});

const styles = StyleSheet.create({
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: fontSizes.title, fontWeight: '700' },
  emptySubtitle: { fontSize: fontSizes.body, textAlign: 'center' },
});
