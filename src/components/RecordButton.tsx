import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export type RecordingState = 'idle' | 'recording' | 'paused';

interface RecordButtonProps {
  recordingState: RecordingState;
  onPress: () => void;
}

export function RecordButton({ recordingState, onPress }: RecordButtonProps) {
  const getButtonStyle = () => {
    switch (recordingState) {
      case 'recording':
        return styles.buttonRecording;
      case 'paused':
        return styles.buttonPaused;
      default:
        return null;
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (recordingState) {
      case 'recording':
        return 'pause';
      case 'paused':
        return 'play';
      default:
        return 'mic';
    }
  };

  const getLabel = () => {
    switch (recordingState) {
      case 'recording':
        return 'Tap to pause';
      case 'paused':
        return 'Tap to resume';
      default:
        return 'Tap to record';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={getIcon()}
          size={48}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      <Text style={styles.label}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 32,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonRecording: {
    backgroundColor: colors.recording,
  },
  buttonPaused: {
    backgroundColor: colors.paused,
  },
  label: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
