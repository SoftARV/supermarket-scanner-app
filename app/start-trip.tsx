import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTheme, spacing, fontSizes, touchTarget, radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StartTrip'>;

export default function StartTripScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { startTrip } = useAppContext();

  const [store, setStore] = useState('');
  const [budgetText, setBudgetText] = useState('');
  const [storeError, setStoreError] = useState(false);

  const handleStart = () => {
    if (!store.trim()) {
      setStoreError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const budget = budgetText ? parseFloat(budgetText.replace(',', '.')) : null;
    startTrip(store.trim(), budget && !isNaN(budget) ? budget : null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ActiveList');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: c.surface, borderBottomColor: c.hairline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.back, { color: c.accent }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.ink }]}>New trip</Text>
        <View style={{ width: 52 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.muted }]}>Store name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, borderColor: storeError ? c.pop : c.hairline, color: c.ink }]}
            placeholder="e.g. Mercadona"
            placeholderTextColor={c.muted}
            value={store}
            onChangeText={(t) => { setStore(t); setStoreError(false); }}
            returnKeyType="next"
            autoFocus
          />
          {storeError && (
            <Text style={[styles.errorText, { color: c.pop }]}>Store name is required</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.muted }]}>Budget (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, borderColor: c.hairline, color: c.ink }]}
            placeholder="€0.00"
            placeholderTextColor={c.muted}
            value={budgetText}
            onChangeText={setBudgetText}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopColor: c.hairline }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: c.accent }]}
          onPress={handleStart}
          accessibilityLabel="Start shopping"
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnLabel, { color: c.accentInk }]}>Start shopping</Text>
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
    borderBottomWidth: 1,
  },
  back: { fontSize: fontSizes.bodyLg, fontWeight: '500' },
  title: { fontSize: fontSizes.title, fontWeight: '700' },
  form: { flex: 1, padding: spacing.md, gap: spacing.lg },
  field: { gap: spacing.xs },
  label: { fontSize: fontSizes.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.bodyLg,
  },
  errorText: { fontSize: fontSizes.caption },
  footer: { padding: spacing.md, borderTopWidth: 1 },
  startBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnLabel: { fontSize: fontSizes.title, fontWeight: '700' },
});
