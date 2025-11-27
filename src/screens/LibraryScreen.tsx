import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { EntryCard } from '../components/EntryCard';
import { Entry } from '../types';
import { getAllEntries } from '../storage/entries';
import { colors } from '../constants/colors';

interface LibraryScreenProps {
  navigation: any;
}

export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const allEntries = await getAllEntries();
      // Sort by timestamp, newest first
      const sorted = allEntries.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(sorted);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });

    loadEntries();

    return unsubscribe;
  }, [navigation, loadEntries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, [loadEntries]);

  function handleEntryPress(entry: Entry) {
    navigation.navigate('EntryDetail', { entryId: entry.id });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard entry={item} onPress={() => handleEntryPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No entries yet</Text>
            <Text style={styles.emptySubtext}>Start capturing your thoughts!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
});

