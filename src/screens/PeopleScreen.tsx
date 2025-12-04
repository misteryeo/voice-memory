import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PersonCard } from '../components/PersonCard';
import { Person } from '../types';
import { getAllPeople } from '../storage/entries';
import { colors } from '../constants/colors';

interface PeopleScreenProps {
  navigation: any;
}

interface Section {
  title: string;
  data: Person[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function PeopleScreen({ navigation }: PeopleScreenProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const sectionListRef = useRef<SectionList<Person>>(null);

  const loadPeople = useCallback(async () => {
    try {
      const allPeople = await getAllPeople();
      // Sort alphabetically by name
      const sorted = allPeople.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      setPeople(sorted);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPeople();
      return () => {};
    }, [loadPeople])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPeople();
    setRefreshing(false);
  }, [loadPeople]);

  // Filter and group people into sections
  const sections = useMemo(() => {
    // Filter by search query
    const filtered = searchQuery
      ? people.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : people;

    // Group by first letter
    const groups: { [key: string]: Person[] } = {};

    for (const person of filtered) {
      const firstLetter = person.name[0]?.toUpperCase() || '#';
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(person);
    }

    // Convert to sections array
    const sectionArray: Section[] = Object.keys(groups)
      .sort()
      .map(letter => ({
        title: letter,
        data: groups[letter],
      }));

    return sectionArray;
  }, [people, searchQuery]);

  // Get available letters (only those with people)
  const availableLetters = useMemo(() => sections.map(s => s.title), [sections]);

  const handlePersonPress = useCallback(
    (person: Person) => {
      navigation.navigate('PersonDetail', { personName: person.name });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Person }) => (
      <PersonCard person={item} onPress={() => handlePersonPress(item)} />
    ),
    [handlePersonPress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ),
    []
  );

  function handleLetterPress(letter: string) {
    const sectionIndex = sections.findIndex(s => s.title === letter);
    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewOffset: 0,
      });
    }
  }

  function clearSearch() {
    setSearchQuery('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>People</Text>
        <Text style={styles.subtitle}>
          {people.length} {people.length === 1 ? 'person' : 'people'} mentioned
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          initialNumToRender={12}
          maxToRenderPerBatch={14}
          windowSize={6}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matches found' : 'No people detected yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'People will appear here as you mention them in entries'}
              </Text>
            </View>
          }
        />

        {/* Alphabet Index */}
        {availableLetters.length > 0 && !searchQuery && (
          <View style={styles.alphabetIndex}>
            {ALPHABET.map(letter => {
              const isAvailable = availableLetters.includes(letter);
              return (
                <TouchableOpacity
                  key={letter}
                  onPress={() => isAvailable && handleLetterPress(letter)}
                  style={styles.alphabetLetterContainer}
                >
                  <Text
                    style={[
                      styles.alphabetLetter,
                      !isAvailable && styles.alphabetLetterDisabled,
                    ]}
                  >
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
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
    marginBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingRight: 40,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  alphabetIndex: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
  },
  alphabetLetterContainer: {
    paddingVertical: 1,
  },
  alphabetLetter: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  alphabetLetterDisabled: {
    color: colors.textLight,
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
