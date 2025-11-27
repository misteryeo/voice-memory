import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entry, Person } from '../types';

const ENTRIES_KEY = '@cortex_journal:entries';

/**
 * Save a new entry to local storage
 */
export async function saveEntry(entry: Entry): Promise<void> {
  try {
    const entries = await getAllEntries();
    entries.push(entry);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
}

/**
 * Get all saved entries
 */
export async function getAllEntries(): Promise<Entry[]> {
  try {
    const data = await AsyncStorage.getItem(ENTRIES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
}

/**
 * Get a single entry by ID
 */
export async function getEntryById(id: string): Promise<Entry | null> {
  try {
    const entries = await getAllEntries();
    return entries.find(entry => entry.id === id) || null;
  } catch (error) {
    console.error('Error getting entry by ID:', error);
    return null;
  }
}

/**
 * Get all entries mentioning a specific person
 */
export async function getEntriesByPerson(name: string): Promise<Entry[]> {
  try {
    const entries = await getAllEntries();
    return entries.filter(entry => 
      entry.names.some(n => n.toLowerCase() === name.toLowerCase())
    );
  } catch (error) {
    console.error('Error getting entries by person:', error);
    return [];
  }
}

/**
 * Extract all unique people from entries with metadata
 */
export async function getAllPeople(): Promise<Person[]> {
  try {
    const entries = await getAllEntries();
    const peopleMap = new Map<string, Person>();

    for (const entry of entries) {
      for (const name of entry.names) {
        const lowerName = name.toLowerCase();
        
        if (!peopleMap.has(lowerName)) {
          // First time seeing this person
          peopleMap.set(lowerName, {
            name: name, // Preserve original capitalization
            firstMentioned: entry.timestamp,
            entryIds: [entry.id],
            themes: [...entry.themes],
          });
        } else {
          // Update existing person
          const person = peopleMap.get(lowerName)!;
          if (entry.timestamp < person.firstMentioned) {
            person.firstMentioned = entry.timestamp;
          }
          person.entryIds.push(entry.id);
          // Merge themes
          entry.themes.forEach(theme => {
            if (!person.themes.includes(theme)) {
              person.themes.push(theme);
            }
          });
        }
      }
    }

    return Array.from(peopleMap.values());
  } catch (error) {
    console.error('Error getting all people:', error);
    return [];
  }
}

/**
 * Delete an entry by ID
 */
export async function deleteEntry(id: string): Promise<void> {
  try {
    const entries = await getAllEntries();
    const filtered = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}

