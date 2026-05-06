import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import {
  useTheme,
  spacing,
  fontSizes,
  fonts,
  touchTarget,
  radius,
} from "@/theme";
import { type RootStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "StartTrip">;

const STORE_PRESETS = [
  "Mercadona",
  "Lidl",
  "Carrefour",
  "Aldi",
  "El Corte Inglés",
];
const BUDGET_PRESETS = [25, 50, 100, 150];

export default function StartTripScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { startTrip } = useAppContext();

  const scheme = useColorScheme();
  const keyboardAppearance = scheme === "dark" ? "dark" : "light";

  const [store, setStore] = useState("");
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [budgetText, setBudgetText] = useState("");
  const [storeError, setStoreError] = useState(false);

  const budgetRef = useRef<TextInput>(null);

  const parsedBudget = parseFloat(budgetText.replace(",", "."));
  const budgetDisplay =
    budgetEnabled && !isNaN(parsedBudget) && parsedBudget > 0
      ? parsedBudget
      : null;

  const handleBudgetToggle = (value: boolean) => {
    setBudgetEnabled(value);
    if (value) {
      setTimeout(() => budgetRef.current?.focus(), 100);
    }
  };

  const handleStart = () => {
    if (!store.trim()) {
      setStoreError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const budget =
      budgetEnabled && !isNaN(parsedBudget) && parsedBudget > 0
        ? parsedBudget
        : null;
    startTrip(store.trim(), budget);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("ActiveList");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Nav bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              styles.navCancel,
              { color: c.muted, fontFamily: fonts.sans500 },
            ]}
          >
            ✕ Cancel
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.navTitle,
            { color: c.muted, fontFamily: fonts.sans500 },
          ]}
        >
          New trip
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text
            style={[styles.heading, { color: c.ink, fontFamily: fonts.serif }]}
          >
            Start a trip
          </Text>
          <Text
            style={[
              styles.subheading,
              { color: c.muted, fontFamily: fonts.sans600 },
            ]}
          >
            WHERE ARE YOU SHOPPING?
          </Text>
        </View>

        {/* Store name */}
        <View style={styles.field}>
          <Text
            style={[
              styles.fieldLabel,
              { color: c.muted, fontFamily: fonts.sans600 },
            ]}
          >
            NAME
          </Text>
          <View
            style={[
              styles.inputUnderline,
              { borderBottomColor: storeError ? c.pop : c.ink },
            ]}
          >
            <TextInput
              style={[
                styles.storeInput,
                { color: c.ink, fontFamily: fonts.sans600 },
              ]}
              placeholder="e.g. Mercadona"
              placeholderTextColor={c.muted}
              value={store}
              onChangeText={(t) => {
                setStore(t);
                setStoreError(false);
              }}
              returnKeyType="done"
              keyboardAppearance={keyboardAppearance}
              autoFocus
            />
          </View>
          {storeError && (
            <Text
              style={[
                styles.errorText,
                { color: c.pop, fontFamily: fonts.sans },
              ]}
            >
              Store name is required
            </Text>
          )}
        </View>

        {/* Store presets */}
        <View style={styles.presetRow}>
          {STORE_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetChip,
                {
                  borderColor: store === preset ? c.accent : c.hairline,
                  backgroundColor: store === preset ? c.accentSoft : c.surface,
                },
              ]}
              onPress={() => {
                setStore(preset);
                setStoreError(false);
              }}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color: store === preset ? c.accent : c.muted,
                    fontFamily: fonts.sans600,
                  },
                ]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget toggle */}
        <View style={[styles.toggleRow]}>
          <View>
            <Text
              style={[
                styles.toggleLabel,
                { color: c.ink, fontFamily: fonts.sans600 },
              ]}
            >
              Set a budget
            </Text>
            <Text
              style={[
                styles.toggleSub,
                { color: c.muted, fontFamily: fonts.sans },
              ]}
            >
              Warn me as I get close
            </Text>
          </View>
          <Switch
            value={budgetEnabled}
            onValueChange={handleBudgetToggle}
            trackColor={{ false: c.surface2, true: c.accent }}
            thumbColor="#fff"
          />
        </View>

        {budgetEnabled && (
          <View
            style={[
              styles.budgetCard,
              { backgroundColor: c.surface, borderColor: c.hairline },
            ]}
          >
            <Text
              style={[
                styles.fieldLabel,
                { color: c.muted, fontFamily: fonts.sans600 },
              ]}
            >
              LIMIT
            </Text>

            {/* Display amount */}
            <View style={styles.budgetAmountRow}>
              <Text
                style={[
                  styles.budgetSymbol,
                  { color: c.muted, fontFamily: fonts.serif },
                ]}
              >
                €
              </Text>
              <TextInput
                ref={budgetRef}
                style={[
                  styles.budgetInput,
                  { color: c.ink, fontFamily: fonts.serif },
                ]}
                placeholder="0"
                placeholderTextColor={c.muted}
                value={budgetText}
                onChangeText={setBudgetText}
                keyboardType="decimal-pad"
                returnKeyType="done"
                keyboardAppearance={keyboardAppearance}
                onSubmitEditing={handleStart}
              />
            </View>

            {/* Budget presets */}
            <View style={styles.budgetPresets}>
              {BUDGET_PRESETS.map((v) => {
                const selected = budgetDisplay === v;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.budgetPresetChip,
                      {
                        backgroundColor: selected ? c.accent : c.surface2,
                        borderColor: selected ? c.accent : c.hairline,
                      },
                    ]}
                    onPress={() => setBudgetText(String(v))}
                  >
                    <Text
                      style={[
                        styles.budgetPresetText,
                        {
                          color: selected ? c.accentInk : c.ink,
                          fontFamily: fonts.sans600,
                        },
                      ]}
                    >
                      €{v}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: c.surface,
            borderTopColor: c.hairline,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: c.accent }]}
          onPress={handleStart}
          accessibilityLabel="Start scanning"
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.startBtnLabel,
              { color: c.accentInk, fontFamily: fonts.sans700 },
            ]}
          >
            Start scanning →
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  navCancel: { fontSize: 14 },
  navTitle: { fontSize: 13, letterSpacing: -0.1 },
  navSpacer: { width: 72 },

  form: { padding: spacing.md + spacing.sm, gap: spacing.lg },

  headingBlock: { gap: 4 },
  heading: { fontSize: 32, fontWeight: "500", letterSpacing: -0.8 },
  subheading: { fontSize: fontSizes.caption, letterSpacing: 0.6 },

  field: { gap: spacing.xs },
  fieldLabel: {
    fontSize: fontSizes.caption,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  inputUnderline: { borderBottomWidth: 1.5, paddingBottom: 6 },
  storeInput: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.4,
    height: 40,
  },
  errorText: { fontSize: fontSizes.caption },

  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
  },
  presetText: { fontSize: 12, fontWeight: "600" },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  toggleLabel: {
    fontSize: fontSizes.bodyLg,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  toggleSub: { fontSize: 11.5, marginTop: 1 },

  budgetCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  budgetAmountRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  budgetSymbol: { fontSize: 18, fontWeight: "400" },
  budgetInput: { fontSize: 42, fontWeight: "500", letterSpacing: -1, flex: 1 },

  budgetPresets: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  budgetPresetChip: {
    height: 30,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetPresetText: { fontSize: 12, fontWeight: "600" },

  footer: { padding: spacing.md, borderTopWidth: 1 },
  startBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnLabel: { fontSize: fontSizes.title, fontWeight: "700" },
});
