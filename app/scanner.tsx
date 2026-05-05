import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuantityPicker } from '../components/QuantityPicker';
import { colors, fontSizes, spacing, touchTarget } from '../constants/theme';
import { useShoppingContext } from '../context/ShoppingContext';
import { useOcrExtraction } from '../hooks/useOcrExtraction';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

export default function ScannerScreen() {
  const navigation = useNavigation<Nav>();
  const { addItem } = useShoppingContext();
  const insets = useSafeAreaInsets();
  const { extract, result, loading, reset } = useOcrExtraction();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nameError, setNameError] = useState('');

  const priceRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (result) {
      setName(result.name);
      setPrice(result.price !== null ? result.price.toFixed(2) : '');
      if (!result.name) {
        nameRef.current?.focus();
      } else if (result.price === null) {
        priceRef.current?.focus();
      }
    }
  }, [result]);

  const launchCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission required',
        'Please enable camera access in Settings to scan price tags.',
        [{ text: 'OK' }],
      );
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.85,
    });
    if (picked.canceled || !picked.assets[0]) return;
    const uri = picked.assets[0].uri;
    setImageUri(uri);
    setName('');
    setPrice('');
    setQuantity(1);
    setNameError('');
    reset();
    await extract(uri);
  }, [extract, reset]);

  useEffect(() => {
    launchCamera();
  }, []);

  const handleAddToList = useCallback(() => {
    if (!name.trim()) {
      setNameError('Please enter a product name');
      nameRef.current?.focus();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setNameError('');
    const normalised = price.replace(',', '.');
    const parsedPrice = parseFloat(normalised) || 0;

    addItem({
      id: Date.now().toString(),
      name: name.trim(),
      pricePerUnit: parsedPrice,
      quantity,
      imageUri: imageUri ?? undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  }, [name, price, quantity, imageUri, addItem, navigation]);

  const handleRetake = useCallback(() => {
    setImageUri(null);
    reset();
    launchCamera();
  }, [launchCamera, reset]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo preview */}
        <View style={styles.preview}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.surface} />
              <Text style={styles.loadingText}>Reading price tag…</Text>
            </View>
          )}
        </View>

        {/* OCR notice when no text found */}
        {result && !result.name && result.price === null && (
          <Text style={styles.ocrNotice}>Couldn't read tag — please type manually</Text>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Product name</Text>
            <TextInput
              ref={nameRef}
              style={[styles.input, nameError ? styles.inputError : null]}
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (t.trim()) setNameError('');
              }}
              placeholder="e.g. Leche entera"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="next"
              onSubmitEditing={() => priceRef.current?.focus()}
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Price (€)</Text>
            <TextInput
              ref={priceRef}
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0,00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Quantity</Text>
            <QuantityPicker quantity={quantity} onChangeQuantity={setQuantity} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToList}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>Add to list</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeText}>Retake photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  preview: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 56,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.surface,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  ocrNotice: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: touchTarget.min,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: fontSizes.caption,
    color: colors.danger,
  },
  actions: {
    gap: spacing.sm,
  },
  addButton: {
    height: touchTarget.fab,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.surface,
  },
  retakeButton: {
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeText: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
