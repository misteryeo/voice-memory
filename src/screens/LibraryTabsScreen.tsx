import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LibraryListScreen } from './LibraryListScreen';
import { CalendarViewScreen } from './CalendarViewScreen';
import { getAllEntries } from '../storage/entries';
import { colors } from '../constants/colors';

const Tab = createMaterialTopTabNavigator();

function ChaptersPlaceholder() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Chapters</Text>
      <Text style={styles.placeholderSubtext}>Coming soon</Text>
    </View>
  );
}

interface LibraryTabsScreenProps {
  navigation: any;
}

export function LibraryTabsScreen({ navigation }: LibraryTabsScreenProps) {
  const [entryCount, setEntryCount] = useState(0);

  const loadEntryCount = useCallback(async () => {
    try {
      const entries = await getAllEntries();
      setEntryCount(entries.length);
    } catch (error) {
      console.error('Error loading entry count:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntryCount();
    });

    loadEntryCount();

    return unsubscribe;
  }, [navigation, loadEntryCount]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarPressColor: 'transparent',
        }}
      >
        <Tab.Screen
          name="LibraryList"
          component={LibraryListScreen}
          options={{ tabBarLabel: 'List' }}
        />
        <Tab.Screen
          name="CalendarView"
          component={CalendarViewScreen}
          options={{ tabBarLabel: 'Calendar' }}
        />
        <Tab.Screen
          name="Chapters"
          component={ChaptersPlaceholder}
          options={{ tabBarLabel: 'Chapters' }}
        />
      </Tab.Navigator>
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
    marginBottom: 16,
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
  tabBar: {
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabIndicator: {
    backgroundColor: colors.primary,
    height: 3,
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
});
