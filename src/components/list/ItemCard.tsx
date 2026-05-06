import * as Haptics from 'expo-haptics';
import { Pencil, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
const EDIT_THRESHOLD = 90;

interface Props {
  item: ScannedItem;
  onRemove: (id: string) => void;
  onEdit: (item: ScannedItem) => void;
  showBorder?: boolean;
}

export const ItemCard = React.memo(function ItemCard({ item, onRemove, onEdit, showBorder = true }: Props) {
  const c = useTheme();
  const lineTotal = item.pricePerUnit * item.quantity;
  const translateX = useSharedValue(0);

  const doRemove = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onRemove(item.id);
  }, [item.id, onRemove]);

  const doEdit = useCallback(() => {
    translateX.value = withSpring(0);
    onEdit(item);
  }, [item, onEdit, translateX]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (translateX.value > EDIT_THRESHOLD) {
        runOnJS(doEdit)();
      } else if (translateX.value < DELETE_THRESHOLD) {
        runOnJS(doRemove)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const editHintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, translateX.value) / EDIT_THRESHOLD),
  }));

  const deleteHintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(Math.min(0, translateX.value)) / Math.abs(DELETE_THRESHOLD)),
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.editHint, { backgroundColor: c.accent }, editHintStyle]}>
        <Pencil size={18} color="#fff" strokeWidth={1.8} />
      </Animated.View>
      <Animated.View style={[styles.deleteHint, { backgroundColor: c.pop }, deleteHintStyle]}>
        <X size={20} color="#fff" strokeWidth={1.8} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.row,
            { backgroundColor: c.surface, borderBottomColor: c.hairline },
            showBorder && styles.rowBorder,
            cardStyle,
          ]}
        >
          {/* Qty badge */}
          <View style={[styles.qtyBadge, { backgroundColor: c.surface2 }]}>
            <Text style={[styles.qtyText, { color: c.muted, fontFamily: fonts.sans600 }]}>×{item.quantity}</Text>
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
  editHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: spacing.md,
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
  rowBorder: { borderBottomWidth: 1 },
  qtyBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14.5, fontWeight: '600', letterSpacing: -0.1 },
  unitPrice: { fontSize: 11 },
  lineTotal: { fontSize: 16, fontWeight: '500', letterSpacing: -0.3 },
});
