import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { useTheme, spacing, fontSizes, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StartTrip'>;

const STORE_PRESETS = ['Mercadona', 'Lidl', 'Carrefour', 'Aldi', 'El Corte Inglés'];

export default function StartTripScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { startTrip } = useAppContext();

  const scheme = useColorScheme();
  const keyboardAppearance = scheme === 'dark' ? 'dark' : 'light';

  const [store, setStore] = useState('');
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [budgetText, setBudgetText] = useState('');
  const [storeError, setStoreError] = useState(false);

  const budgetRef = useRef<TextInput>(null);

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
    const budget = budgetEnabled && budgetText ? parseFloat(budgetText.replace(',', '.')) : null;
    startTrip(store.trim(), budget && !isNaN(budget) ? budget : null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ActiveList');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.back, { color: c.accent }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.ink }]}>New trip</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {/* Store name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.muted }]}>Store name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.surface,
                borderBottomColor: storeError ? c.pop : c.accent,
                color: c.ink,
              },
            ]}
            placeholder="e.g. Mercadona"
            placeholderTextColor={c.muted}
            value={store}
            onChangeText={(t) => { setStore(t); setStoreError(false); }}
            returnKeyType="done"
            keyboardAppearance={keyboardAppearance}
            autoFocus
          />
          {storeError && (
            <Text style={[styles.errorText, { color: c.pop }]}>Store name is required</Text>
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
              onPress={() => { setStore(preset); setStoreError(false); }}
            >
              <Text style={[styles.presetText, { color: store === preset ? c.accent : c.muted }]}>
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget toggle */}
        <View style={[styles.toggleRow, { borderColor: c.hairline, backgroundColor: c.surface }]}>
          <Text style={[styles.toggleLabel, { color: c.ink }]}>Set a budget</Text>
          <Switch
            value={budgetEnabled}
            onValueChange={handleBudgetToggle}
            trackColor={{ false: c.surface2, true: c.accentSoft }}
            thumbColor={budgetEnabled ? c.accent : c.muted}
          />
        </View>

        {budgetEnabled && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.muted }]}>Budget amount</Text>
            <TextInput
              ref={budgetRef}
              style={[
                styles.input,
                { backgroundColor: c.surface, borderBottomColor: c.accent, color: c.ink },
              ]}
              placeholder="0,00"
              placeholderTextColor={c.muted}
              value={budgetText}
              onChangeText={setBudgetText}
              keyboardType="decimal-pad"
              returnKeyType="done"
              keyboardAppearance={keyboardAppearance}
              onSubmitEditing={handleStart}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: c.accent }]}
          onPress={handleStart}
          accessibilityLabel="Start scanning"
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnLabel, { color: c.accentInk }]}>Start scanning →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  back: { fontSize: fontSizes.bodyLg, fontWeight: '500' },
  headerSpacer: { width: 52 },
  title: { fontSize: fontSizes.title, fontWeight: '700' },
  form: { padding: spacing.md, gap: spacing.lg },
  field: { gap: spacing.xs },
  label: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: touchTarget.min,
    borderBottomWidth: 2,
    paddingHorizontal: 0,
    fontSize: fontSizes.large,
    fontWeight: '500',
  },
  errorText: { fontSize: fontSizes.caption },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  presetText: { fontSize: fontSizes.caption, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  toggleLabel: { fontSize: fontSizes.bodyLg, fontWeight: '500' },
  footer: { padding: spacing.md, borderTopWidth: 1 },
  startBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnLabel: { fontSize: fontSizes.title, fontWeight: '700' },
});
