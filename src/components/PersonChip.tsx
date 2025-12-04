import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface PersonChipProps {
  name: string;
  onRemove: () => void;
}

function PersonChipBase({ name, onRemove }: PersonChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{name}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

export const PersonChip = memo(PersonChipBase);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
  },
});
