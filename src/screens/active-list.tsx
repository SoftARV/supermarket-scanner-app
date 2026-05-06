import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Camera, ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingList } from '@/components/list/ShoppingList';
import { BudgetBar } from '@/components/ui/BudgetBar';
import { LastAddedBadge } from '@/components/ui/LastAddedBadge';
import { ReviewSheet } from '@/components/ui/ReviewSheet';
import { TotalDisplay } from '@/components/ui/TotalDisplay';
import { useAppContext } from '@/context/AppContext';
import { useTheme, fontSizes, fonts, spacing, touchTarget, radius } from '@/theme';
import { type RootStackParamList, type ScannedItem } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ActiveList'>;

export default function ActiveListScreen() {
  const c = useTheme();
  const { activeTrip, removeItem, updateQuantity, updateItem } = useAppContext();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [editingItem, setEditingItem] = useState<ScannedItem | null>(null);

  const items = activeTrip?.items ?? [];
  const total = activeTrip?.total ?? 0;
  const storeName = activeTrip?.store ?? 'Basket';

  const handleFinish = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('FinishTrip');
  }, [navigation]);

  const handleScan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Camera');
  }, [navigation]);

  const handleEdit = useCallback((item: ScannedItem) => {
    setEditingItem(item);
  }, []);

  const handleEditSubmit = useCallback((name: string, price: string, quantity: number) => {
    if (!editingItem) return;
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    updateItem(editingItem.id, name.trim(), parsedPrice, quantity);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingItem(null);
  }, [editingItem, updateItem]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Nav bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity
          style={styles.navLeft}
          onPress={() => navigation.navigate('History')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color={c.muted} strokeWidth={1.8} />
          <Text style={[styles.navLeftLabel, { color: c.muted, fontFamily: fonts.sans500 }]}>History</Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <View style={[styles.activeDot, { backgroundColor: c.accent }]} />
          <Text style={[styles.navTitle, { color: c.muted, fontFamily: fonts.sans500 }]} numberOfLines={1}>
            Active · {storeName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navRight}
          onPress={handleFinish}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.navFinish, { color: c.ink, fontFamily: fonts.sans600 }]}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>
            THIS TRIP · {items.length} ITEM{items.length !== 1 ? 'S' : ''}
          </Text>
          <TotalDisplay total={total} size="xl" />
          {activeTrip?.budget != null && (
            <View style={styles.heroBudget}>
              <BudgetBar spent={total} budget={activeTrip.budget} />
            </View>
          )}
          {items.length > 0 && (
            <LastAddedBadge item={items[items.length - 1]} />
          )}
        </View>

        {/* Items card */}
        <View style={styles.itemsWrapper}>
          <ShoppingList items={items} onRemove={removeItem} onUpdateQuantity={updateQuantity} onEdit={handleEdit} />
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.bg },
        ]}
      >
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: c.accent }]}
          onPress={handleScan}
          accessibilityLabel="Scan next item"
          activeOpacity={0.85}
        >
          <Camera size={18} color={c.accentInk} strokeWidth={1.6} />
          <Text style={[styles.scanBtnLabel, { color: c.accentInk, fontFamily: fonts.sans700 }]}>
            Scan next item
          </Text>
        </TouchableOpacity>
      </View>

      {editingItem && (
        <ReviewSheet
          mode="edit"
          initialName={editingItem.name}
          initialPrice={editingItem.pricePerUnit.toFixed(2)}
          initialQuantity={editingItem.quantity}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md - 2,
    paddingBottom: spacing.sm,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 72,
  },
  navLeftLabel: { fontSize: 14 },
  navCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  navTitle: { fontSize: 13, letterSpacing: -0.1 },
  navRight: { minWidth: 72, alignItems: 'flex-end' },
  navFinish: { fontSize: 14, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  hero: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  heroLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  heroBudget: { marginTop: 2 },

  itemsWrapper: { marginTop: spacing.xs },

  footer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scanBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  scanBtnLabel: { fontSize: fontSizes.bodyLg, fontWeight: '700' },
});
