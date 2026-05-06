import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  type TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CandidateChips } from '@/components/ui/CandidateChips';
import { QuantityPicker } from '@/components/ui/QuantityPicker';
import { useTheme, fontSizes, fonts, spacing, radius } from '@/theme';
import { type OcrResult } from '@/types';

interface ReviewSheetProps {
  mode: 'add' | 'edit';
  initialName?: string;
  initialPrice?: string;
  initialQuantity?: number;
  ocrResult?: OcrResult | null;
  ocrLoading?: boolean;
  onClose: () => void;
  onSubmit: (name: string, price: string, quantity: number) => void;
}

export function ReviewSheet({
  mode,
  initialName = '',
  initialPrice = '',
  initialQuantity = 1,
  ocrResult,
  ocrLoading,
  onClose,
  onSubmit,
}: ReviewSheetProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardAppearance = useColorScheme() === 'dark' ? 'dark' : 'light';
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['62%', '90%'], []);

  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [nameError, setNameError] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [priceEdited, setPriceEdited] = useState(false);

  const priceRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  // Populate fields from OCR result as it arrives (add mode only)
  useEffect(() => {
    if (!ocrResult || mode !== 'add') return;
    if (!nameEdited) setName(ocrResult.name);
    if (!priceEdited) setPrice(ocrResult.price !== null ? ocrResult.price.toFixed(2) : '');
    if (!ocrResult.name) nameRef.current?.focus();
    else if (ocrResult.price === null) priceRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrResult]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      setNameError('Please enter a product name');
      nameRef.current?.focus();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setNameError('');
    onSubmit(name, price, quantity);
  }, [name, price, quantity, onSubmit]);

  const formattedPriceCandidates = (ocrResult?.priceCandidates ?? []).map((p) => `€${p.toFixed(2)}`);
  const currentPriceForChip = price ? `€${parseFloat(price.replace(',', '.')).toFixed(2)}` : '';

  const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
  const lineTotal = parsedPrice * quantity;
  const submitLabel =
    mode === 'edit' ? 'Save changes' : lineTotal > 0 ? `Add  · €${lineTotal.toFixed(2)}` : 'Add to list';
  const dismissLabel = mode === 'edit' ? 'Cancel' : 'Retry';

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: c.surface }}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: c.muted }]}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'add' && !ocrLoading && ocrResult && (
          <View style={styles.extractionBadge}>
            <View style={[styles.extractionDot, { backgroundColor: c.accent }]} />
            <Text style={[styles.extractionText, { color: c.accent, fontFamily: fonts.sans600 }]}>
              {ocrResult.name || ocrResult.price !== null
                ? 'EXTRACTED · REVIEW BELOW'
                : "COULDN'T READ TAG — TYPE MANUALLY"}
            </Text>
          </View>
        )}
        {mode === 'add' && ocrLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={c.accent} />
            <Text style={[styles.loadingText, { color: c.muted, fontFamily: fonts.sans }]}>
              Reading price tag…
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>ITEM</Text>
          <BottomSheetTextInput
            ref={nameRef}
            style={[
              styles.nameInput,
              { borderBottomColor: nameError ? c.pop : c.hairline, color: c.ink, fontFamily: fonts.sans600 },
            ]}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setNameEdited(true);
              if (t.trim()) setNameError('');
            }}
            placeholder="e.g. Leche entera"
            placeholderTextColor={c.muted}
            returnKeyType="next"
            keyboardAppearance={keyboardAppearance}
            onSubmitEditing={() => priceRef.current?.focus()}
            autoCapitalize="words"
          />
          {nameError ? (
            <Text style={[styles.errorText, { color: c.pop, fontFamily: fonts.sans }]}>{nameError}</Text>
          ) : null}
          {mode === 'add' && !nameEdited && (
            <CandidateChips
              candidates={ocrResult?.nameCandidates ?? []}
              currentValue={name}
              onSelect={(v) => setName(v)}
              testID="name-chips"
            />
          )}
        </View>

        <View style={styles.priceQtyRow}>
          <View style={styles.priceBlock}>
            <Text style={[styles.fieldLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>PRICE</Text>
            <BottomSheetTextInput
              ref={priceRef}
              style={[
                styles.priceInput,
                { borderBottomColor: c.hairline, color: c.ink, fontFamily: fonts.serif },
              ]}
              value={price}
              onChangeText={(t) => { setPrice(t); setPriceEdited(true); }}
              placeholder="0,00"
              placeholderTextColor={c.muted}
              keyboardType="decimal-pad"
              returnKeyType="done"
              keyboardAppearance={keyboardAppearance}
            />
            {mode === 'add' && !priceEdited && (
              <CandidateChips
                candidates={formattedPriceCandidates}
                currentValue={currentPriceForChip}
                onSelect={(v) => setPrice(v.replace('€', ''))}
                testID="price-chips"
              />
            )}
          </View>

          <View style={styles.qtyBlock}>
            <Text style={[styles.fieldLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>QTY</Text>
            <QuantityPicker quantity={quantity} onChangeQuantity={setQuantity} />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.dismissBtn, { borderColor: c.hairline }]}
            onPress={() => bottomSheetRef.current?.close()}
            activeOpacity={0.75}
          >
            <Text style={[styles.dismissBtnText, { color: c.ink, fontFamily: fonts.sans600 }]}>
              {dismissLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: c.accent }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitBtnText, { color: c.accentInk, fontFamily: fonts.sans700 }]}>
              {submitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.md },
  handleIndicator: { width: 36, height: 4 },

  extractionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  extractionDot: { width: 6, height: 6, borderRadius: 3 },
  extractionText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSizes.body },

  field: { gap: spacing.xs },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  nameInput: {
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: -0.3,
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
    paddingHorizontal: 0,
    height: 40,
  },
  errorText: { fontSize: fontSizes.caption },

  priceQtyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  priceBlock: { flex: 1, gap: spacing.xs },
  priceInput: {
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -0.5,
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
    paddingHorizontal: 0,
    height: 48,
  },
  qtyBlock: { gap: spacing.xs, paddingBottom: 2 },

  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  dismissBtn: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: { fontSize: fontSizes.body, fontWeight: '600' },
  submitBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: fontSizes.bodyLg, fontWeight: '700' },
});
