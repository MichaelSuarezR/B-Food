import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#1f2937',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});