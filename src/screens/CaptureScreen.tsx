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
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { RecordButton, RecordingState } from '../components/RecordButton';
import { colors } from '../constants/colors';
import { transcribeAudio } from '../utils/transcription';
import { detectNames } from '../utils/nameDetection';
import { detectThemes } from '../utils/themeDetection';

interface CaptureScreenProps {
  navigation: any;
}

export function CaptureScreen({ navigation }: CaptureScreenProps) {
  const [textInput, setTextInput] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

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
      setRecordingState('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }

  async function pauseRecording() {
    if (!recording) return;

    try {
      await recording.pauseAsync();
      setRecordingState('paused');
    } catch (error) {
      console.error('Failed to pause recording:', error);
      Alert.alert('Error', 'Failed to pause recording.');
    }
  }

  async function resumeRecording() {
    if (!recording) return;

    try {
      await recording.startAsync();
      setRecordingState('recording');
    } catch (error) {
      console.error('Failed to resume recording:', error);
      Alert.alert('Error', 'Failed to resume recording.');
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      setRecordingState('idle');
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

  async function discardRecording() {
    if (!recording) return;

    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              setRecordingState('idle');
              await recording.stopAndUnloadAsync();
              setRecording(null);
            } catch (error) {
              console.error('Failed to discard recording:', error);
            }
          },
        },
      ]
    );
  }

  async function handleSubmit(type: 'voice' | 'text', audioUri?: string) {
    setIsProcessing(true);
    try {
      let transcription = '';

      if (type === 'voice' && audioUri) {
        setProcessingStatus('Preparing audio...');
        // Small delay to show first status
        await new Promise(r => setTimeout(r, 100));

        setProcessingStatus('Transcribing...');
        transcription = await transcribeAudio(audioUri);
      } else if (type === 'text' && textInput.trim()) {
        transcription = textInput.trim();
      } else {
        Alert.alert('Error', 'Please record audio or enter text.');
        setIsProcessing(false);
        return;
      }

      setProcessingStatus('Analyzing content...');
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
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  }

  function handleRecordPress() {
    switch (recordingState) {
      case 'idle':
        startRecording();
        break;
      case 'recording':
        pauseRecording();
        break;
      case 'paused':
        resumeRecording();
        break;
    }
  }

  function handleStopPress() {
    stopRecording();
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

  const isActiveRecording = recordingState !== 'idle';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cortex Journal</Text>
        <Text style={styles.subtitle}>Capture your thoughts.</Text>
      </View>

      <View style={styles.content}>
        <RecordButton recordingState={recordingState} onPress={handleRecordPress} />

        {isActiveRecording && (
          <View style={styles.recordingActions}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopPress}
              activeOpacity={0.8}
            >
              <Text style={styles.stopButtonText}>Stop & Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={discardRecording}
              activeOpacity={0.6}
            >
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isActiveRecording && (
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

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingStatus}>{processingStatus}</Text>
          </View>
        </View>
      )}
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
  recordingActions: {
    alignItems: 'center',
    marginTop: 16,
  },
  stopButton: {
    backgroundColor: colors.text,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  stopButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  discardText: {
    fontSize: 14,
    color: colors.recording,
    marginTop: 16,
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  processingStatus: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
});
