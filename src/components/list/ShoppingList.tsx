import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from '@/components/list/ItemCard';
import { useTheme, fontSizes, spacing } from '@/theme';
import { type ScannedItem } from '@/types';

interface Props {
  items: ScannedItem[];
  onRemove: (id: string) => void;
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

const Separator = () => <View style={styles.separator} />;

export const ShoppingList = React.memo(function ShoppingList({ items, onRemove }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: ScannedItem }) => <ItemCard item={item} onRemove={onRemove} />,
    [onRemove],
  );

  const keyExtractor = useCallback((item: ScannedItem) => item.id, []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={EmptyState}
      ItemSeparatorComponent={Separator}
      removeClippedSubviews
      maxToRenderPerBatch={12}
      windowSize={5}
      initialNumToRender={12}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
    />
  );
});

const styles = StyleSheet.create({
  emptyContainer: { flex: 1 },
  listContent: { padding: spacing.md, paddingTop: spacing.sm },
  separator: { height: spacing.sm },
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
