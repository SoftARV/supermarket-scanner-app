import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, fontSizes, spacing, radius } from '@/theme';
import { type ScannedItem } from '@/types';

const CARD_HEIGHT = 68;
const DELETE_THRESHOLD = -90;
// Delete zone background is always pop-red; icon must be white regardless of theme.
const DELETE_ICON_COLOR = '#fff';

interface Props {
  item: ScannedItem;
  onRemove: (id: string) => void;
}

export const ItemCard = React.memo(function ItemCard({ item, onRemove }: Props) {
  const c = useTheme();
  const lineTotal = item.pricePerUnit * item.quantity;
  const translateX = useSharedValue(0);

  const doRemove = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onRemove(item.id);
  }, [item.id, onRemove]);

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
        <Text style={styles.deleteIcon}>✕</Text>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }, cardStyle]}
        >
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.ink }]} numberOfLines={1}>
              {item.name || 'Unnamed item'}
            </Text>
            <Text style={[styles.meta, { color: c.muted }]}>
              {item.quantity} × €{item.pricePerUnit.toFixed(2)}
            </Text>
          </View>
          <Text style={[styles.lineTotal, { color: c.ink }]}>
            €{lineTotal.toFixed(2)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    height: CARD_HEIGHT,
  },
  deleteHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  deleteIcon: { color: DELETE_ICON_COLOR, fontSize: fontSizes.title, fontWeight: '700' },
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: fontSizes.bodyLg, fontWeight: '600' },
  meta: { fontSize: fontSizes.caption },
  lineTotal: { fontSize: fontSizes.bodyLg, fontWeight: '700' },
});
