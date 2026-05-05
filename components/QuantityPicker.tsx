import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, spacing, touchTarget } from '../constants/theme';

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
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onChangeQuantity(Math.max(min, quantity - 1))}
        accessibilityLabel="Decrease quantity"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.quantity}>{quantity}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onChangeQuantity(quantity + 1)}
        accessibilityLabel="Increase quantity"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: fontSizes.title,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quantity: {
    fontSize: fontSizes.title,
    color: colors.textPrimary,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
});
