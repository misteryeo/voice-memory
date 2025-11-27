import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../types';
import { colors } from '../constants/colors';

interface EntryCardProps {
  entry: Entry;
  onPress: () => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const preview = entry.transcription.length > 80 
    ? entry.transcription.substring(0, 80) + '...'
    : entry.transcription;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {entry.type === 'voice' ? (
            <Ionicons name="mic" size={20} color={colors.primary} />
          ) : (
            <Text style={styles.textIcon}>T</Text>
          )}
        </View>
        <Text style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
      <Text style={styles.preview}>{preview}</Text>
      {entry.names.length > 0 && (
        <View style={styles.namesContainer}>
          {entry.names.slice(0, 3).map((name, index) => (
            <View key={index} style={styles.nameBadge}>
              <Text style={styles.nameText}>{name}</Text>
            </View>
          ))}
          {entry.names.length > 3 && (
            <Text style={styles.moreNames}>+{entry.names.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  timestamp: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  preview: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  nameText: {
    fontSize: 12,
    color: colors.text,
  },
  moreNames: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});

