import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Person, Entry } from '../types';
import { getAllPeople, getEntriesByPerson } from '../storage/entries';
import { EntryCard } from '../components/EntryCard';
import { colors } from '../constants/colors';

interface PersonDetailScreenProps {
  route: {
    params: {
      personName: string;
    };
  };
  navigation: any;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PersonDetailScreen({ route, navigation }: PersonDetailScreenProps) {
  const { personName } = route.params;
  const [person, setPerson] = useState<Person | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    loadPersonData();
  }, [personName]);

  async function loadPersonData() {
    try {
      const allPeople = await getAllPeople();
      const foundPerson = allPeople.find(p => p.name.toLowerCase() === personName.toLowerCase());
      
      if (foundPerson) {
        setPerson(foundPerson);
        const personEntries = await getEntriesByPerson(foundPerson.name);
        // Sort by timestamp, newest first
        const sorted = personEntries.sort((a, b) => b.timestamp - a.timestamp);
        setEntries(sorted);
      }
    } catch (error) {
      console.error('Error loading person data:', error);
    }
  }

  function handleEntryPress(entry: Entry) {
    navigation.navigate('EntryDetail', { entryId: entry.id });
  }

  if (!person) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const initials = getInitials(person.name);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{person.name}</Text>
      </View>

      <View style={styles.avatarSection}>
        <LinearGradient
          colors={colors.avatarGradient}
          style={styles.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>First mentioned</Text>
          <Text style={styles.infoValue}>{formatDate(person.firstMentioned)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total entries</Text>
          <Text style={styles.infoValue}>{person.entryIds.length}</Text>
        </View>
      </View>

      {person.themes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Themes</Text>
          <View style={styles.badgesContainer}>
            {person.themes.map((theme, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.entriesSection}>
        <Text style={styles.sectionTitle}>Entries</Text>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onPress={() => handleEntryPress(entry)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No entries found</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.chipBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: colors.text,
  },
  entriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

