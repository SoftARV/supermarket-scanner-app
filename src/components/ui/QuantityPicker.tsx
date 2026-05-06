import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, fontSizes, fonts, radius, spacing, touchTarget } from '@/theme';

interface Props {
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  min?: number;
}

export const QuantityPicker = React.memo(function QuantityPicker({
  quantity,
  onChangeQuantity,
  min = 1,
}: Props) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.surface2 }]}
        onPress={() => onChangeQuantity(Math.max(min, quantity - 1))}
        accessibilityLabel="Decrease quantity"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.buttonText, { color: c.ink, fontFamily: fonts.sans700 }]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.quantity, { color: c.ink, fontFamily: fonts.sans700 }]}>{quantity}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.surface2 }]}
        onPress={() => onChangeQuantity(quantity + 1)}
        accessibilityLabel="Increase quantity"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.buttonText, { color: c.ink, fontFamily: fonts.sans700 }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: fontSizes.title, fontWeight: '700' },
  quantity: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
});
