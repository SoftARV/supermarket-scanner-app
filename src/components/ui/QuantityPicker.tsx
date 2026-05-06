import { Minus, Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme, fonts, radius } from "@/theme";

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
    <View style={[styles.container, { backgroundColor: c.surface2 }]}>
      <TouchableOpacity
        style={styles.minusBtn}
        onPress={() => onChangeQuantity(Math.max(min, quantity - 1))}
        accessibilityLabel="Decrease quantity"
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Minus
          size={18}
          color={quantity <= min ? c.muted : c.ink}
          strokeWidth={1.8}
        />
      </TouchableOpacity>
      <Text
        style={[styles.quantity, { color: c.ink, fontFamily: fonts.serif }]}
      >
        {quantity}
      </Text>
      <TouchableOpacity
        style={[styles.plusBtn, { backgroundColor: c.accent }]}
        onPress={() => onChangeQuantity(quantity + 1)}
        accessibilityLabel="Increase quantity"
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Plus size={18} color={c.accentInk} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.full,
    padding: 4,
  },
  minusBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  plusBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontSize: 18,
    minWidth: 32,
    textAlign: "center",
  },
});
