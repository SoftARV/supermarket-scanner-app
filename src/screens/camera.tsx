import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useTheme, fontSizes, spacing, touchTarget, radius } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

type Phase = 'viewfinder' | 'review';

// Camera chrome is always white-on-black regardless of system theme.
const CAMERA_WHITE = '#fff';
const CAMERA_BTN_BG = 'rgba(0,0,0,0.45)';
const SHUTTER_RING_BG = 'rgba(255,255,255,0.25)';
const HINT_BG = 'rgba(0,0,0,0.55)';

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

  if (!permission) return <View style={[styles.container, { backgroundColor: c.bg }]} />;

  return (
    // eslint-disable-next-line react-native/no-color-literals, react-native/no-inline-styles
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Viewfinder */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Corner reticles */}
      {phase === 'viewfinder' && (
        <View style={styles.reticleContainer} pointerEvents="none">
          <View style={[styles.corner, styles.topLeft, styles.reticleColor]} />
          <View style={[styles.corner, styles.topRight, styles.reticleColor]} />
          <View style={[styles.corner, styles.bottomLeft, styles.reticleColor]} />
          <View style={[styles.corner, styles.bottomRight, styles.reticleColor]} />
        </View>
      )}

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + spacing.sm }]}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Close camera"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Running total chip */}
      {phase === 'viewfinder' && (
        <View style={[styles.totalChip, { top: insets.top + spacing.sm }]}>
          <Text style={styles.totalChipText}>€{runningTotal.toFixed(2)}</Text>
        </View>
      )}

      {/* Hint pill */}
      {phase === 'viewfinder' && (
        <View style={styles.hintPill} pointerEvents="none">
          <Text style={styles.hintText}>Aim at price tag</Text>
        </View>
      )}

      {/* Shutter row */}
      {phase === 'viewfinder' && (
        <View style={[styles.shutterBar, { paddingBottom: insets.bottom + spacing.lg }]}>
          {/* Left slot: flash placeholder */}
          <View style={styles.shutterSideSlot} />

          {/* Shutter */}
          <TouchableOpacity
            style={styles.shutter}
            onPress={handleShutter}
            accessibilityLabel="Take photo"
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Right slot: item count badge */}
          <View style={styles.shutterSideSlot}>
            {(activeTrip?.items.length ?? 0) > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{activeTrip?.items.length}</Text>
              </View>
            )}
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
              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={c.accent} />
                  <Text style={[styles.loadingText, { color: c.muted }]}>Reading price tag…</Text>
                </View>
              )}
              {result && !result.name && result.price === null && (
                <Text style={[styles.ocrNotice, { color: c.muted }]}>
                  Couldn&apos;t read tag — please type manually
                </Text>
              )}

              {/* Name */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: c.muted }]}>Product name</Text>
                <TextInput
                  ref={nameRef}
                  style={[styles.input, { backgroundColor: c.surface2, borderColor: nameError ? c.pop : c.hairline, color: c.ink }]}
                  value={name}
                  onChangeText={(t) => { setName(t); setNameEdited(true); if (t.trim()) setNameError(''); }}
                  placeholder="e.g. Leche entera"
                  placeholderTextColor={c.muted}
                  returnKeyType="next"
                  keyboardAppearance={keyboardAppearance}
                  onSubmitEditing={() => priceRef.current?.focus()}
                  autoCapitalize="words"
                />
                {nameError ? <Text style={[styles.errorText, { color: c.pop }]}>{nameError}</Text> : null}
                {!nameEdited && (
                  <CandidateChips
                    candidates={result?.nameCandidates ?? []}
                    currentValue={name}
                    onSelect={(v) => setName(v)}
                    testID="name-chips"
                  />
                )}
              </View>

              {/* Price */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: c.muted }]}>Price (€)</Text>
                <TextInput
                  ref={priceRef}
                  style={[styles.input, { backgroundColor: c.surface2, borderColor: c.hairline, color: c.ink }]}
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

              {/* Quantity */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: c.muted }]}>Quantity</Text>
                <QuantityPicker quantity={quantity} onChangeQuantity={setQuantity} />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: c.accent }]}
                  onPress={handleAdd}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.addBtnText, { color: c.accentInk }]}>Add to list</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                  <Text style={[styles.retakeBtnText, { color: c.muted }]}>Retake photo</Text>
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
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // reticle
  reticleContainer: {
    ...StyleSheet.absoluteFillObject,
    margin: 48,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  reticleColor: { borderColor: CAMERA_WHITE },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },

  // close
  closeBtn: {
    position: 'absolute',
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMERA_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: CAMERA_WHITE, fontSize: 16, fontWeight: '600' },

  // running total chip
  totalChip: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: HINT_BG,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  totalChipText: { color: CAMERA_WHITE, fontSize: fontSizes.bodyLg, fontWeight: '700' },

  // hint pill
  hintPill: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    backgroundColor: HINT_BG,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  hintText: { color: CAMERA_WHITE, fontSize: fontSizes.caption, fontWeight: '500' },

  // shutter row
  shutterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  shutterSideSlot: {
    width: touchTarget.shutter,
    height: touchTarget.shutter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: touchTarget.shutter,
    height: touchTarget.shutter,
    borderRadius: touchTarget.shutter / 2,
    backgroundColor: SHUTTER_RING_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: CAMERA_WHITE,
  },
  shutterInner: {
    width: touchTarget.shutter - 20,
    height: touchTarget.shutter - 20,
    borderRadius: (touchTarget.shutter - 20) / 2,
    backgroundColor: CAMERA_WHITE,
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMERA_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CAMERA_WHITE,
  },
  countBadgeText: { color: CAMERA_WHITE, fontSize: fontSizes.body, fontWeight: '700' },

  // review sheet
  sheetWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '85%',
  },
  sheetScroll: { padding: spacing.md, gap: spacing.md },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSizes.body },
  ocrNotice: { fontSize: fontSizes.caption, textAlign: 'center', fontStyle: 'italic' },

  field: { gap: spacing.xs },
  fieldLabel: { fontSize: fontSizes.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: touchTarget.min,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.bodyLg,
  },
  errorText: { fontSize: fontSizes.caption },

  actions: { gap: spacing.sm, marginTop: spacing.xs },
  addBtn: {
    height: touchTarget.fab,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: fontSizes.title, fontWeight: '700' },
  retakeBtn: { height: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  retakeBtnText: { fontSize: fontSizes.body, fontWeight: '500' },
});
