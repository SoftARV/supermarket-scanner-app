import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReviewSheet } from '@/components/ui/ReviewSheet';
import { useAppContext } from '@/context/AppContext';
import { useOcrExtraction } from '@/hooks/useOcrExtraction';
import { useTheme, fonts, spacing, touchTarget } from '@/theme';
import { type RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

type Phase = 'viewfinder' | 'review';

const CAMERA_WHITE = '#fff';
const CAMERA_BTN_BG = 'rgba(0,0,0,0.52)';
const SHUTTER_RING_BG = 'rgba(255,255,255,0.22)';

export default function CameraScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { addItem, activeTrip } = useAppContext();
  const { extract, result, loading, reset } = useOcrExtraction();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [phase, setPhase] = useState<Phase>('viewfinder');
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

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

  const toggleFlash = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  }, []);

  const handleShutter = useCallback(async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: true });
      if (!photo) return;
      setCapturedUri(photo.uri);
      setPhase('review');
      reset();
      await extract(photo.uri);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [extract, reset]);

  // Called when review sheet is dismissed (drag-to-close or Retry)
  const handleSheetClose = useCallback(() => {
    setCapturedUri(null);
    setPhase('viewfinder');
    reset();
  }, [reset]);

  const handleAdd = useCallback((name: string, price: string, quantity: number) => {
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
  }, [capturedUri, addItem, navigation]);

  const runningTotal = activeTrip?.total ?? 0;
  const itemCount = activeTrip?.items.length ?? 0;

  if (!permission) return <View style={[styles.container, { backgroundColor: c.bg }]} />;

  return (
    // eslint-disable-next-line react-native/no-color-literals, react-native/no-inline-styles
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Background: live viewfinder OR frozen captured frame */}
      {phase === 'viewfinder' ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" flash={flashMode} />
      ) : capturedUri ? (
        <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : null}

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
          <X size={14} color={CAMERA_WHITE} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* Shutter row — viewfinder only */}
      {phase === 'viewfinder' && (
        <View style={[styles.shutterBar, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={[styles.sideBtn, flashMode === 'on' && styles.sideBtnActive]}
            onPress={toggleFlash}
            accessibilityLabel="Toggle flash"
          >
            <Zap size={18} color={flashMode === 'on' ? CAMERA_WHITE : 'rgba(255,255,255,0.7)'} strokeWidth={1.6} fill={flashMode === 'on' ? CAMERA_WHITE : 'none'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutter}
            onPress={handleShutter}
            accessibilityLabel="Take photo"
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={[styles.sideBtn, styles.sideBtnSpacer]} />
        </View>
      )}

      {phase === 'review' && (
        <ReviewSheet
          mode="add"
          ocrResult={result}
          ocrLoading={loading}
          onClose={handleSheetClose}
          onSubmit={handleAdd}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
  sideBtnSpacer: { opacity: 0 },
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

});
