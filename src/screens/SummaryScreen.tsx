import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PersonChip } from '../components/PersonChip';
import { colors } from '../constants/colors';
import { saveEntry } from '../storage/entries';
import { Entry } from '../types';
import { generateAITitle } from '../utils/titleGeneration';

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
  const [editedTranscription, setEditedTranscription] = useState(transcription);
  const [isEditingTranscription, setIsEditingTranscription] = useState(false);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');

  // Title state
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleLoading, setTitleLoading] = useState(true);

  // Generate AI title on mount
  useEffect(() => {
    async function fetchTitle() {
      setTitleLoading(true);
      try {
        const generatedTitle = await generateAITitle(transcription, initialNames);
        setTitle(generatedTitle);
      } catch (error) {
        console.error('Error generating title:', error);
        setTitle('Untitled moment');
      } finally {
        setTitleLoading(false);
      }
    }

    fetchTitle();
  }, [transcription, initialNames]);

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

  function handleTitleEditDone() {
    setIsEditingTitle(false);
    if (!title.trim()) {
      setTitle('Untitled moment');
    }
  }

  async function handleSave() {
    try {
      const entry: Entry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        audioPath: audioUri,
        transcription: editedTranscription,
        names,
        themes: initialThemes,
        timestamp: Date.now(),
        textNote,
        title: title.trim() || 'Untitled moment',
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
        <Text style={styles.headerTitle}>Review Entry</Text>
        <Text style={styles.subtitle}>Check and confirm details</Text>
      </View>

      {/* Title Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Title</Text>
          {!titleLoading && (
            <TouchableOpacity
              onPress={() => isEditingTitle ? handleTitleEditDone() : setIsEditingTitle(true)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditingTitle ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {titleLoading ? (
          <View style={styles.titleLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.titleLoadingText}>Generating title...</Text>
          </View>
        ) : isEditingTitle ? (
          <View style={styles.titleEditContainer}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              autoFocus
              selectTextOnFocus
              onBlur={handleTitleEditDone}
              onSubmitEditing={handleTitleEditDone}
              returnKeyType="done"
              maxLength={60}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.titleDisplay}
            onPress={() => setIsEditingTitle(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.titleText}>{title}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transcription Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Transcription</Text>
          <TouchableOpacity
            onPress={() => setIsEditingTranscription(!isEditingTranscription)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditingTranscription ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
        {isEditingTranscription ? (
          <TextInput
            style={styles.transcriptionInput}
            value={editedTranscription}
            onChangeText={setEditedTranscription}
            multiline
            autoFocus
          />
        ) : (
          <Text style={styles.transcription}>{editedTranscription}</Text>
        )}
      </View>

      {/* People Card */}
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
  headerTitle: {
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Title styles
  titleLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  titleLoadingText: {
    marginLeft: 10,
    fontSize: 15,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  titleDisplay: {
    paddingVertical: 4,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
  },
  titleEditContainer: {
    marginTop: -4,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  // Transcription styles
  transcription: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  transcriptionInput: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  // People styles
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
