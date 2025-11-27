import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { PersonCard } from '../components/PersonCard';
import { Person } from '../types';
import { getAllPeople } from '../storage/entries';
import { colors } from '../constants/colors';

interface PeopleScreenProps {
  navigation: any;
}

export function PeopleScreen({ navigation }: PeopleScreenProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPeople = useCallback(async () => {
    try {
      const allPeople = await getAllPeople();
      // Sort by entry count (most mentioned first)
      const sorted = allPeople.sort((a, b) => b.entryIds.length - a.entryIds.length);
      setPeople(sorted);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPeople();
    });

    loadPeople();

    return unsubscribe;
  }, [navigation, loadPeople]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPeople();
    setRefreshing(false);
  }, [loadPeople]);

  function handlePersonPress(person: Person) {
    navigation.navigate('PersonDetail', { personName: person.name });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>People</Text>
        <Text style={styles.subtitle}>
          {people.length} {people.length === 1 ? 'person' : 'people'} mentioned
        </Text>
      </View>

      <FlatList
        data={people}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PersonCard person={item} onPress={() => handlePersonPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No people detected yet</Text>
            <Text style={styles.emptySubtext}>People will appear here as you mention them in entries</Text>
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
    textAlign: 'center',
  },
});

