import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../types';
import { getAllEntries, deleteEntry } from '../storage/entries';
import { colors } from '../constants/colors';
import { generateEntryTitle } from '../utils/generateEntryTitle';

interface CalendarViewScreenProps {
  navigation: any;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

function formatDateString(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatReadableDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}


export function CalendarViewScreen({ navigation }: CalendarViewScreenProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const allEntries = await getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });

    loadEntries();

    return unsubscribe;
  }, [navigation, loadEntries]);

  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};

    for (const entry of entries) {
      const dateStr = formatDateString(entry.timestamp);
      marks[dateStr] = {
        marked: true,
        dotColor: colors.primary,
      };
    }

    // Add selection styling if a date is selected
    if (selectedDate && marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    } else if (selectedDate) {
      marks[selectedDate] = {
        marked: false,
        dotColor: colors.primary,
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marks;
  }, [entries, selectedDate]);

  function handleDayPress(day: DateData) {
    const dayEntries = entries
      .filter(e => formatDateString(e.timestamp) === day.dateString)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (dayEntries.length > 0) {
      setSelectedDate(day.dateString);
      setSelectedEntries(dayEntries);
      setModalVisible(true);
    }
  }

  function handleEntryPress(entry: Entry) {
    setModalVisible(false);
    navigation.navigate('EntryDetail', { entryId: entry.id });
  }

  function handleEntryLongPress(entry: Entry) {
    Alert.alert(
      'Entry Options',
      'What would you like to do?',
      [
        {
          text: 'Edit',
          onPress: () => {
            setModalVisible(false);
            navigation.navigate('EditEntry', { entryId: entry.id });
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(entry),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  function confirmDelete(entry: Entry) {
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
              await deleteEntry(entry.id);
              // Update the selected entries list
              const updatedEntries = selectedEntries.filter(e => e.id !== entry.id);
              setSelectedEntries(updatedEntries);
              if (updatedEntries.length === 0) {
                setModalVisible(false);
              }
              loadEntries();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          },
        },
      ]
    );
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedDate(null);
  }

  function renderEntryItem({ item }: { item: Entry }) {
    const title = item.title || generateEntryTitle(item.transcription, item.names);

    return (
      <TouchableOpacity
        style={styles.entryItem}
        onPress={() => handleEntryPress(item)}
        onLongPress={() => handleEntryLongPress(item)}
        activeOpacity={0.7}
        delayLongPress={400}
      >
        <View style={styles.entryIcon}>
          {item.type === 'voice' ? (
            <Ionicons name="mic" size={16} color={colors.primary} />
          ) : (
            <Ionicons name="document-text" size={16} color={colors.textSecondary} />
          )}
        </View>
        <View style={styles.entryContent}>
          <Text style={styles.entryTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.entryTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textLight,
          dotColor: colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatReadableDate(selectedDate) : ''}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.entryCount}>
              {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
            </Text>

            <FlatList
              data={selectedEntries}
              keyExtractor={(item) => item.id}
              renderItem={renderEntryItem}
              style={styles.entryList}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  calendar: {
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  entryCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  entryList: {
    flexGrow: 0,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  entryTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
