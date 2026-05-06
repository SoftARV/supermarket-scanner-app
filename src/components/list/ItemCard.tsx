import * as Haptics from 'expo-haptics';
import { Minus, Plus, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, fonts, spacing, ITEM_HEIGHT } from '@/theme';
import { type ScannedItem } from '@/types';

const DELETE_THRESHOLD = -90;

interface Props {
  item: ScannedItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  showBorder?: boolean;
}

export const ItemCard = React.memo(function ItemCard({ item, onRemove, onUpdateQuantity, showBorder = true }: Props) {
  const c = useTheme();
  const lineTotal = item.pricePerUnit * item.quantity;
  const translateX = useSharedValue(0);

  const doRemove = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onRemove(item.id);
  }, [item.id, onRemove]);

  const decrement = useCallback(() => {
    if (item.quantity <= 1) return;
    Haptics.selectionAsync();
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const increment = useCallback(() => {
    Haptics.selectionAsync();
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const panGesture = Gesture.Pan()
    .activeOffsetX(-10)
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        runOnJS(doRemove)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteHintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / Math.abs(DELETE_THRESHOLD)),
  }));

  return (
    <View style={[styles.wrapper, { backgroundColor: c.pop }]}>
      <Animated.View style={[styles.deleteHint, deleteHintStyle]}>
        <X size={20} color="#fff" strokeWidth={1.8} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.row,
            { backgroundColor: c.surface, borderBottomColor: c.hairline, borderBottomWidth: showBorder ? 1 : 0 },
            cardStyle,
          ]}
        >
          {/* Qty badge with stepper */}
          <View style={[styles.qtyBadge, { backgroundColor: c.surface2 }]}>
            <TouchableOpacity
              style={styles.stepTouch}
              onPress={decrement}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityLabel="Decrease quantity"
            >
              <Minus size={14} color={item.quantity > 1 ? c.ink : c.muted} strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: c.muted, fontFamily: fonts.sans600 }]}>×{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.stepTouch, styles.stepPlus, { backgroundColor: c.accent }]}
              onPress={increment}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityLabel="Increase quantity"
            >
              <Plus size={14} color={c.accentInk} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>

          {/* Name + unit price */}
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.ink, fontFamily: fonts.sans600 }]} numberOfLines={1}>
              {item.name || 'Unnamed item'}
            </Text>
            <Text style={[styles.unitPrice, { color: c.muted, fontFamily: fonts.sans }]}>
              €{item.pricePerUnit.toFixed(2)} / unit
            </Text>
          </View>

          {/* Line total */}
          <Text style={[styles.lineTotal, { color: c.ink, fontFamily: fonts.serif }]}>
            €{lineTotal.toFixed(2)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    height: ITEM_HEIGHT,
  },
  deleteHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  row: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md - 4,
  },
  qtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stepTouch: {
    width: 26,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPlus: {
    borderRadius: 0,
  },
  qtyText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, minWidth: 20, textAlign: 'center' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14.5, fontWeight: '600', letterSpacing: -0.1 },
  unitPrice: { fontSize: 11 },
  lineTotal: { fontSize: 16, fontWeight: '500', letterSpacing: -0.3 },
});
