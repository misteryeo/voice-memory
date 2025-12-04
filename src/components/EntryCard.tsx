import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../types';
import { colors } from '../constants/colors';
import { generateEntryTitle } from '../utils/generateEntryTitle';

interface EntryCardProps {
  entry: Entry;
  onPress: () => void;
  onLongPress?: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return formatTime(timestamp);
  } else if (diffDays === 1) {
    return `Yesterday, ${formatTime(timestamp)}`;
  } else if (diffDays < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${dayName}, ${formatTime(timestamp)}`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}

interface PeopleChipsProps {
  names: string[];
}

function PeopleChips({ names }: PeopleChipsProps) {
  if (names.length === 0) return null;

  return (
    <View style={styles.peopleContainer}>
      <Text style={styles.peopleLabel}>People:</Text>
      <View style={styles.chipsRow}>
        {names.slice(0, 3).map((name, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        ))}
        {names.length > 3 && (
          <Text style={styles.moreText}>+{names.length - 3}</Text>
        )}
      </View>
    </View>
  );
}

function EntryCardBase({ entry, onPress, onLongPress }: EntryCardProps) {
  const title = entry.title || generateEntryTitle(entry.transcription, entry.names);
  const timestamp = formatDate(entry.timestamp);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={400}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {entry.type === 'voice' ? (
            <Ionicons name="mic" size={16} color={colors.primary} />
          ) : (
            <Ionicons name="document-text" size={16} color={colors.textSecondary} />
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </View>

      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>

      <PeopleChips names={entry.names} />
    </TouchableOpacity>
  );
}

export const EntryCard = memo(EntryCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  peopleLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: colors.chipBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
});
