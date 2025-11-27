import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);

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

  function handleTypeInstead() {
    setModalVisible(true);
  }

  function handleModalSubmit() {
    if (textInput.trim()) {
      setModalVisible(false);
      handleSubmit('text');
    } else {
      Alert.alert('Error', 'Please enter some text.');
    }
  }

  function handleModalClose() {
    setModalVisible(false);
    setTextInput('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cortex Journal</Text>
        <Text style={styles.subtitle}>Capture your thoughts.</Text>
      </View>

      <View style={styles.content}>
        <RecordButton isRecording={isRecording} onPress={handleRecordPress} />

        {!isRecording && (
          <TouchableOpacity onPress={handleTypeInstead} activeOpacity={0.6}>
            <Text style={styles.typeInstead}>Type instead</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Type your thoughts</Text>
              <TouchableOpacity onPress={handleModalClose} activeOpacity={0.6}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="What's on your mind..."
              placeholderTextColor={colors.textLight}
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.modalButton,
                !textInput.trim() && styles.modalButtonDisabled,
              ]}
              onPress={handleModalSubmit}
              activeOpacity={0.8}
              disabled={!textInput.trim()}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 80,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  typeInstead: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 4,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
});

