import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../types';
import { getEntryById, deleteEntry } from '../storage/entries';
import { colors } from '../constants/colors';

interface EntryDetailScreenProps {
  route: {
    params: {
      entryId: string;
    };
  };
  navigation: any;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function EntryDetailScreen({ route, navigation }: EntryDetailScreenProps) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<Entry | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadEntry();
    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [entryId]);

  // Reload entry when returning from edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntry();
    });
    return unsubscribe;
  }, [navigation]);

  async function loadEntry() {
    const loadedEntry = await getEntryById(entryId);
    setEntry(loadedEntry);
  }

  function handleEdit() {
    navigation.navigate('EditEntry', { entryId });
  }

  function handleDelete() {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entryId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          },
        },
      ]
    );
  }

  async function playAudio() {
    if (!entry?.audioPath) return;

    try {
      if (sound) {
        // If sound is already loaded, just play/pause
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            await sound.playAsync();
            setIsPlaying(true);
          }
        }
      } else {
        // Load and play
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: entry.audioPath },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Entry Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color={colors.recording} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <View style={styles.iconContainer}>
            {entry.type === 'voice' ? (
              <Ionicons name="mic" size={20} color={colors.primary} />
            ) : (
              <Text style={styles.textIcon}>T</Text>
            )}
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</Text>
        </View>
      </View>

      {entry.audioPath && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={playAudio}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={colors.background}
          />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transcription</Text>
        <Text style={styles.transcription}>{entry.transcription}</Text>
      </View>

      {entry.names.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>People</Text>
          <View style={styles.badgesContainer}>
            {entry.names.map((name, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {entry.themes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Themes</Text>
          <View style={styles.badgesContainer}>
            {entry.themes.map((theme, index) => (
              <View key={index} style={[styles.badge, styles.themeBadge]}>
                <Text style={styles.badgeText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  playButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
  themeBadge: {
    backgroundColor: colors.primary + '20',
  },
  badgeText: {
    fontSize: 14,
    color: colors.text,
  },
});

