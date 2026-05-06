import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CandidateChips } from '@/components/ui/CandidateChips';
import { QuantityPicker } from '@/components/ui/QuantityPicker';
import { SheetHandle } from '@/components/ui/SheetHandle';
import { useAppContext } from '@/context/AppContext';
import { useOcrExtraction } from '@/hooks/useOcrExtraction';
import { useTheme, fontSizes, fonts, spacing, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

type Phase = 'viewfinder' | 'review';

const CAMERA_WHITE = '#fff';
const CAMERA_BTN_BG = 'rgba(255,255,255,0.16)';
const SHUTTER_RING_BG = 'rgba(255,255,255,0.25)';
const HINT_BG = 'rgba(0,0,0,0.4)';

export default function CameraScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { addItem, activeTrip } = useAppContext();
  const { extract, result, loading, reset } = useOcrExtraction();

  const [permission, requestPermission] = useCameraPermissions();
  const keyboardAppearance = useColorScheme() === 'dark' ? 'dark' : 'light';
  const cameraRef = useRef<CameraView>(null);

  const [phase, setPhase] = useState<Phase>('viewfinder');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nameError, setNameError] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [priceEdited, setPriceEdited] = useState(false);

  const priceRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission().then((res) => {
        if (!res.granted) {
          Alert.alert(
            'Camera permission required',
            'Please enable camera access in Settings to scan price tags.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }
      });
    }
  }, [navigation, permission, requestPermission]);

  useEffect(() => {
    if (result) {
      setName(result.name);
      setPrice(result.price !== null ? result.price.toFixed(2) : '');
      setNameEdited(false);
      setPriceEdited(false);
      if (!result.name) {
        nameRef.current?.focus();
      } else if (result.price === null) {
        priceRef.current?.focus();
      }
    }
  }, [result]);

  const handleShutter = useCallback(async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: true });
      if (!photo) return;
      setCapturedUri(photo.uri);
      setPhase('review');
      setName('');
      setPrice('');
      setQuantity(1);
      setNameError('');
      setNameEdited(false);
      setPriceEdited(false);
      reset();
      await extract(photo.uri);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [extract, reset]);

  const handleRetake = useCallback(() => {
    setCapturedUri(null);
    setPhase('viewfinder');
    reset();
  }, [reset]);

  const handleAdd = useCallback(() => {
    if (!name.trim()) {
      setNameError('Please enter a product name');
      nameRef.current?.focus();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setNameError('');
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    addItem({
      id: Date.now().toString(),
      name: name.trim(),
      pricePerUnit: parsedPrice,
      quantity,
      imageUri: capturedUri ?? undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  }, [name, price, quantity, capturedUri, addItem, navigation]);

  const formattedPriceCandidates = (result?.priceCandidates ?? []).map((p) => `€${p.toFixed(2)}`);
  const currentPriceForChip = price ? `€${parseFloat(price.replace(',', '.')).toFixed(2)}` : '';
  const runningTotal = activeTrip?.total ?? 0;
  const itemCount = activeTrip?.items.length ?? 0;

  const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
  const lineTotal = parsedPrice * quantity;
  const addBtnLabel = lineTotal > 0 ? `Add  · €${lineTotal.toFixed(2)}` : 'Add to list';

  if (!permission) return <View style={[styles.container, { backgroundColor: c.bg }]} />;

  return (
    // eslint-disable-next-line react-native/no-color-literals, react-native/no-inline-styles
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Background: live viewfinder OR frozen captured frame */}
      {phase === 'viewfinder' ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : capturedUri ? (
        <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : null}

      {/* Corner reticles — viewfinder only */}
      {phase === 'viewfinder' && (
        <View style={styles.reticleContainer} pointerEvents="none">
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      )}

      {/* Top row: total chip (left) + close button (right) */}
      <View style={[styles.topRow, { top: insets.top + spacing.sm }]}>
        {phase === 'viewfinder' && (
          <View style={styles.totalChip}>
            <Text style={[styles.totalChipLabel, { fontFamily: fonts.sans600 }]}>TOTAL</Text>
            <Text style={[styles.totalChipAmount, { fontFamily: fonts.serif }]}>
              €{runningTotal.toFixed(2)}
            </Text>
            {itemCount > 0 && (
              <Text style={styles.totalChipCount}>· {itemCount}</Text>
            )}
          </View>
        )}
        {phase === 'review' && (
          <View style={styles.capturedChip}>
            <Text style={styles.capturedChipText}>Captured</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close camera"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Hint pill — viewfinder only */}
      {phase === 'viewfinder' && (
        <View style={styles.hintPill} pointerEvents="none">
          <View style={[styles.hintDot, { backgroundColor: c.accent }]} />
          <Text style={[styles.hintText, { fontFamily: fonts.sans500 }]}>
            Price tag detected · tap to capture
          </Text>
        </View>
      )}

      {/* Shutter row — viewfinder only */}
      {phase === 'viewfinder' && (
        <View style={[styles.shutterBar, { paddingBottom: insets.bottom + spacing.lg }]}>
          {/* Flash placeholder */}
          <View style={[styles.sideBtn, styles.flashBtn]}>
            <Text style={styles.sideBtnText}>⚡</Text>
          </View>

          {/* Shutter */}
          <TouchableOpacity
            style={styles.shutter}
            onPress={handleShutter}
            accessibilityLabel="Take photo"
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* List badge */}
          <View style={[styles.sideBtn, itemCount > 0 && styles.sideBtnActive]}>
            <Text style={styles.sideBtnText}>{itemCount > 0 ? `${itemCount}` : 'List'}</Text>
          </View>
        </View>
      )}

      {/* Review sheet */}
      {phase === 'review' && (
        <KeyboardAvoidingView
          style={styles.sheetWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.sheet, { backgroundColor: c.surface }]}>
            <SheetHandle />

            <ScrollView
              contentContainerStyle={[styles.sheetScroll, { paddingBottom: insets.bottom + spacing.xl }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* Extraction status badge */}
              {!loading && result && (
                <View style={styles.extractionBadge}>
                  <View style={[styles.extractionDot, { backgroundColor: c.accent }]} />
                  <Text style={[styles.extractionText, { color: c.accent, fontFamily: fonts.sans600 }]}>
                    {result.name || result.price !== null
                      ? 'EXTRACTED · REVIEW BELOW'
                      : "COULDN'T READ TAG — TYPE MANUALLY"}
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={c.accent} />
                  <Text style={[styles.loadingText, { color: c.muted, fontFamily: fonts.sans }]}>
                    Reading price tag…
                  </Text>
                </View>
              )}

              {/* Item name */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>ITEM</Text>
                <TextInput
                  ref={nameRef}
                  style={[
                    styles.nameInput,
                    {
                      borderBottomColor: nameError ? c.pop : c.hairline,
                      color: c.ink,
                      fontFamily: fonts.sans600,
                    },
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
                {!nameEdited && (
                  <CandidateChips
                    candidates={result?.nameCandidates ?? []}
                    currentValue={name}
                    onSelect={(v) => setName(v)}
                    testID="name-chips"
                  />
                )}
              </View>

              {/* Price + Qty row */}
              <View style={styles.priceQtyRow}>
                <View style={styles.priceBlock}>
                  <Text style={[styles.fieldLabel, { color: c.muted, fontFamily: fonts.sans600 }]}>PRICE</Text>
                  <TextInput
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
                  {!priceEdited && (
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

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.retakeBtn, { borderColor: c.hairline }]}
                  onPress={handleRetake}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.retakeBtnText, { color: c.ink, fontFamily: fonts.sans600 }]}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: c.accent, flex: 1 }]}
                  onPress={handleAdd}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.addBtnText, { color: c.accentInk, fontFamily: fonts.sans700 }]}>
                    {addBtnLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 2.5;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // reticles
  reticleContainer: {
    ...StyleSheet.absoluteFillObject,
    margin: 48,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: CAMERA_WHITE },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },

  // top row
  topRow: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  totalChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: CAMERA_BTN_BG,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  totalChipLabel: { color: CAMERA_WHITE, fontSize: 10, fontWeight: '600', letterSpacing: 0.6, opacity: 0.8 },
  totalChipAmount: { color: CAMERA_WHITE, fontSize: 17, fontWeight: '600' },
  totalChipCount: { color: CAMERA_WHITE, fontSize: 10, opacity: 0.7 },
  capturedChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: CAMERA_BTN_BG,
    justifyContent: 'center',
  },
  capturedChipText: { color: CAMERA_WHITE, fontSize: 12 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMERA_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: CAMERA_WHITE, fontSize: 14, fontWeight: '600' },

  // hint
  hintPill: {
    position: 'absolute',
    alignSelf: 'center',
    top: '55%',
    backgroundColor: HINT_BG,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
  },
  hintDot: { width: 6, height: 6, borderRadius: 3 },
  hintText: { color: CAMERA_WHITE, fontSize: 12, fontWeight: '500', letterSpacing: -0.1 },

  // shutter
  shutterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CAMERA_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnActive: {
    borderWidth: 2,
    borderColor: CAMERA_WHITE,
  },
  flashBtn: {},
  sideBtnText: { color: CAMERA_WHITE, fontSize: 11, fontWeight: '600' },
  shutter: {
    width: touchTarget.shutter,
    height: touchTarget.shutter,
    borderRadius: touchTarget.shutter / 2,
    backgroundColor: SHUTTER_RING_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: CAMERA_WHITE,
  },
  shutterInner: {
    width: touchTarget.shutter - 18,
    height: touchTarget.shutter - 18,
    borderRadius: (touchTarget.shutter - 18) / 2,
    backgroundColor: CAMERA_WHITE,
  },

  // review sheet
  sheetWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '90%',
  },
  sheetScroll: { padding: spacing.md, gap: spacing.md },

  extractionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
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
  retakeBtn: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeBtnText: { fontSize: fontSizes.body, fontWeight: '600' },
  addBtn: {
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: fontSizes.bodyLg, fontWeight: '700' },
});
