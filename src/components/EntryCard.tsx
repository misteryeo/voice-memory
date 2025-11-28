import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../types';
import { colors } from '../constants/colors';

interface EntryCardProps {
  entry: Entry;
  onPress: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getFirstLine(text: string, maxLength: number = 60): string {
  // Get first line or first maxLength characters
  const firstLine = text.split('\n')[0];
  if (firstLine.length <= maxLength) {
    return firstLine;
  }
  return firstLine.substring(0, maxLength).trim() + '...';
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const preview = getFirstLine(entry.transcription);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {entry.type === 'voice' ? (
            <Ionicons name="mic" size={18} color={colors.primary} />
          ) : (
            <Ionicons name="document-text" size={18} color={colors.textSecondary} />
          )}
        </View>
        <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </View>

      <Text style={styles.preview} numberOfLines={2}>{preview}</Text>

      {entry.names.length > 0 && (
        <View style={styles.namesContainer}>
          {entry.names.slice(0, 2).map((name, index) => (
            <View key={index} style={styles.nameBadge}>
              <Text style={styles.nameText}>{name}</Text>
            </View>
          ))}
          {entry.names.length > 2 && (
            <Text style={styles.moreNames}>+{entry.names.length - 2} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timestamp: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  preview: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  namesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  nameBadge: {
    backgroundColor: colors.chipBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  nameText: {
    fontSize: 12,
    color: colors.text,
  },
  moreNames: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
