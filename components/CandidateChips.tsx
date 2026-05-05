import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, spacing } from '../constants/theme';

interface Props {
  candidates: string[];
  currentValue: string;
  onSelect: (value: string) => void;
  testID?: string;
}

export const CandidateChips = React.memo(function CandidateChips({
  candidates,
  currentValue,
  onSelect,
  testID,
}: Props) {
  const handlePress = useCallback(
    (value: string) => {
      Haptics.selectionAsync();
      onSelect(value);
    },
    [onSelect],
  );

  if (candidates.length === 0) return null;

  return (
    <View style={styles.wrapper} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.row}
      >
        {candidates.map((candidate) => {
          const isActive = candidate === currentValue;
          return (
            <TouchableOpacity
              key={candidate}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handlePress(candidate)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {candidate}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  chip: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 180,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  chipTextActive: {
    color: colors.surface,
  },
});
