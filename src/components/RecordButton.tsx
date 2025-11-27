import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
}

export function RecordButton({ isRecording, onPress }: RecordButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.buttonRecording
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="mic" 
          size={48} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
      <Text style={styles.label}>
        {isRecording ? 'Recording...' : 'Tap to record'}
      </Text>
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
  label: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

