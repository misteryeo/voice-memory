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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getEntryById, updateEntry } from '../storage/entries';
import { Entry } from '../types';

interface EditEntryScreenProps {
  route: {
    params: {
      entryId: string;
    };
  };
  navigation: any;
}

export function EditEntryScreen({ route, navigation }: EditEntryScreenProps) {
  const { entryId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<Entry | null>(null);

  // Editable fields
  const [title, setTitle] = useState('');
  const [transcription, setTranscription] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);

  // Input states for adding new items
  const [newNameInput, setNewNameInput] = useState('');
  const [newThemeInput, setNewThemeInput] = useState('');
  const [isAddingName, setIsAddingName] = useState(false);
  const [isAddingTheme, setIsAddingTheme] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  async function loadEntry() {
    setLoading(true);
    try {
      const loadedEntry = await getEntryById(entryId);
      if (loadedEntry) {
        setEntry(loadedEntry);
        setTitle(loadedEntry.title || '');
        setTranscription(loadedEntry.transcription);
        setNames([...loadedEntry.names]);
        setThemes([...loadedEntry.themes]);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load entry.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  function hasChanges(): boolean {
    if (!entry) return false;
    return (
      title !== (entry.title || '') ||
      transcription !== entry.transcription ||
      JSON.stringify(names) !== JSON.stringify(entry.names) ||
      JSON.stringify(themes) !== JSON.stringify(entry.themes)
    );
  }

  function handleCancel() {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }

  async function handleSave() {
    if (!entry) return;

    setSaving(true);
    try {
      await updateEntry(entryId, {
        title: title.trim() || undefined,
        transcription: transcription.trim(),
        names,
        themes,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function removeName(nameToRemove: string) {
    setNames(names.filter(name => name !== nameToRemove));
  }

  function addName() {
    const trimmed = newNameInput.trim();
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed]);
    }
    setNewNameInput('');
    setIsAddingName(false);
  }

  function removeTheme(themeToRemove: string) {
    setThemes(themes.filter(theme => theme !== themeToRemove));
  }

  function addTheme() {
    const trimmed = newThemeInput.trim();
    if (trimmed && !themes.includes(trimmed)) {
      setThemes([...themes, trimmed]);
    }
    setNewThemeInput('');
    setIsAddingTheme(false);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Entry not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Entry</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title..."
            placeholderTextColor={colors.textLight}
            maxLength={60}
          />
        </View>

        {/* Transcription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          <TextInput
            style={styles.transcriptionInput}
            value={transcription}
            onChangeText={setTranscription}
            multiline
            placeholder="Enter transcription..."
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* People */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People</Text>
            {!isAddingName && (
              <TouchableOpacity onPress={() => setIsAddingName(true)}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isAddingName && (
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add name..."
                placeholderTextColor={colors.textLight}
                value={newNameInput}
                onChangeText={setNewNameInput}
                autoFocus
                onSubmitEditing={addName}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addButton} onPress={addName}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelAddButton}
                onPress={() => {
                  setNewNameInput('');
                  setIsAddingName(false);
                }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.chipsContainer}>
            {names.length > 0 ? (
              names.map((name, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{name}</Text>
                  <TouchableOpacity
                    onPress={() => removeName(name)}
                    style={styles.chipRemove}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No people tagged</Text>
            )}
          </View>
        </View>

        {/* Themes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Themes</Text>
            {!isAddingTheme && (
              <TouchableOpacity onPress={() => setIsAddingTheme(true)}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isAddingTheme && (
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add theme..."
                placeholderTextColor={colors.textLight}
                value={newThemeInput}
                onChangeText={setNewThemeInput}
                autoFocus
                onSubmitEditing={addTheme}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addButton} onPress={addTheme}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelAddButton}
                onPress={() => {
                  setNewThemeInput('');
                  setIsAddingTheme(false);
                }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.chipsContainer}>
            {themes.length > 0 ? (
              themes.map((theme, index) => (
                <View key={index} style={[styles.chip, styles.themeChip]}>
                  <Text style={styles.chipText}>{theme}</Text>
                  <TouchableOpacity
                    onPress={() => removeTheme(theme)}
                    style={styles.chipRemove}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No themes tagged</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcriptionInput: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelAddButton: {
    padding: 8,
    marginLeft: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBackground,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  themeChip: {
    backgroundColor: colors.primary + '20',
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  chipRemove: {
    padding: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
