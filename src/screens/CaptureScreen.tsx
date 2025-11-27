import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { RecordButton } from '../components/RecordButton';
import { colors } from '../constants/colors';
import { transcribeAudio } from '../utils/transcription';
import { detectNames } from '../utils/nameDetection';
import { detectThemes } from '../utils/themeDetection';

interface CaptureScreenProps {
  navigation: any;
}

export function CaptureScreen({ navigation }: CaptureScreenProps) {
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  async function startRecording() {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to record audio.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Navigate to summary with audio
        await handleSubmit('voice', uri);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  }

  async function handleSubmit(type: 'voice' | 'text', audioUri?: string) {
    try {
      let transcription = '';
      
      if (type === 'voice' && audioUri) {
        // Transcribe audio
        transcription = await transcribeAudio(audioUri);
      } else if (type === 'text' && textInput.trim()) {
        transcription = textInput.trim();
      } else {
        Alert.alert('Error', 'Please record audio or enter text.');
        return;
      }

      // Detect names and themes
      const names = detectNames(transcription);
      const themes = detectThemes(transcription);

      // Navigate to summary screen
      navigation.navigate('Summary', {
        type,
        audioUri,
        transcription,
        names,
        themes,
        textNote: type === 'text' ? textInput : undefined,
      });

      // Reset form
      setTextInput('');
    } catch (error) {
      console.error('Error processing entry:', error);
      Alert.alert('Error', 'Failed to process entry. Please try again.');
    }
  }

  function handleRecordPress() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function handleTextSubmit() {
    if (textInput.trim()) {
      handleSubmit('text');
    } else {
      Alert.alert('Error', 'Please enter some text.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cortex Journal</Text>
        <Text style={styles.subtitle}>Capture your thoughts</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your thoughts..."
            placeholderTextColor={colors.textLight}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            editable={!isRecording}
          />
        </View>

        {!isRecording && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <RecordButton isRecording={isRecording} onPress={handleRecordPress} />

            <TouchableOpacity
              style={styles.textButton}
              onPress={handleTextSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.textButtonIcon}>⌨️</Text>
              <Text style={styles.textButtonText}>Continue with Text</Text>
            </TouchableOpacity>
          </>
        )}

        {isRecording && (
          <RecordButton isRecording={isRecording} onPress={handleRecordPress} />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
    minHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  textButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  textButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

