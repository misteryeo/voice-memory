import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { PersonChip } from '../components/PersonChip';
import { colors } from '../constants/colors';
import { saveEntry } from '../storage/entries';
import { Entry } from '../types';

interface SummaryScreenProps {
  route: {
    params: {
      type: 'voice' | 'text';
      audioUri?: string;
      transcription: string;
      names: string[];
      themes: string[];
      textNote?: string;
    };
  };
  navigation: any;
}

export function SummaryScreen({ route, navigation }: SummaryScreenProps) {
  const { type, audioUri, transcription, names: initialNames, themes: initialThemes, textNote } = route.params;
  
  const [names, setNames] = useState<string[]>(initialNames);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');

  function removeName(nameToRemove: string) {
    setNames(names.filter(name => name !== nameToRemove));
  }

  function addName() {
    const trimmed = newNameInput.trim();
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed]);
      setNewNameInput('');
    }
  }

  async function handleSave() {
    try {
      const entry: Entry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        audioPath: audioUri,
        transcription,
        names,
        themes: initialThemes,
        timestamp: Date.now(),
        textNote,
      };

      await saveEntry(entry);
      
      Alert.alert('Success', 'Entry saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Capture'),
        },
      ]);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Entry</Text>
        <Text style={styles.subtitle}>Check and confirm details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transcription</Text>
        <Text style={styles.transcription}>{transcription}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Detected People</Text>
          <TouchableOpacity
            onPress={() => setIsEditingNames(!isEditingNames)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {isEditingNames && (
          <View style={styles.addNameContainer}>
            <TextInput
              style={styles.nameInput}
              placeholder="Add name..."
              placeholderTextColor={colors.textLight}
              value={newNameInput}
              onChangeText={setNewNameInput}
              onSubmitEditing={addName}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addName}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.chipsContainer}>
          {names.length > 0 ? (
            names.map((name, index) => (
              <PersonChip
                key={index}
                name={name}
                onRemove={() => removeName(name)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No people detected</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
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
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  transcription: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  addNameContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
});

