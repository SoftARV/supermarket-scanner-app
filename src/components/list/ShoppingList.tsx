import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ItemCard } from '@/components/list/ItemCard';
import { useTheme, fontSizes, fonts, spacing, radius } from '@/theme';
import { type ScannedItem } from '@/types';

interface Props {
  items: ScannedItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export const EmptyListState = React.memo(function EmptyListState() {
  const c = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: c.surface, borderColor: c.hairline }]}>
        <Text style={[styles.emptyIconText, { color: c.accent }]}>📷</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: c.ink, fontFamily: fonts.sans600 }]}>
        Scan your first item
      </Text>
      <Text style={[styles.emptySubtitle, { color: c.muted, fontFamily: fonts.sans }]}>
        Point at a price tag{'\n'}and tap to capture
      </Text>
    </View>
  );
});

export const ShoppingList = React.memo(function ShoppingList({ items, onRemove, onUpdateQuantity }: Props) {
  const c = useTheme();

  if (items.length === 0) {
    return <EmptyListState />;
  }

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}>
      {items.map((item, i) => (
        <ItemCard
          key={item.id}
          item={item}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
          showBorder={i < items.length - 1}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md - 4,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: { fontSize: 26 },
  emptyTitle: { fontSize: fontSizes.bodyLg, fontWeight: '600', letterSpacing: -0.2, textAlign: 'center' },
  emptySubtitle: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
