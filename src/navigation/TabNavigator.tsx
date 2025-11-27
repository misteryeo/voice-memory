import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Screens
import { CaptureScreen } from '../screens/CaptureScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { EntryDetailScreen } from '../screens/EntryDetailScreen';
import { PeopleScreen } from '../screens/PeopleScreen';
import { PersonDetailScreen } from '../screens/PersonDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();
const PeopleStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Capture" component={CaptureScreen} />
      <HomeStack.Screen name="Summary" component={SummaryScreen} />
    </HomeStack.Navigator>
  );
}

function LibraryStackNavigator() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryList" component={LibraryScreen} />
      <LibraryStack.Screen name="EntryDetail" component={EntryDetailScreen} />
    </LibraryStack.Navigator>
  );
}

function PeopleStackNavigator() {
  return (
    <PeopleStack.Navigator screenOptions={{ headerShown: false }}>
      <PeopleStack.Screen name="PeopleList" component={PeopleScreen} />
      <PeopleStack.Screen name="PersonDetail" component={PersonDetailScreen} />
    </PeopleStack.Navigator>
  );
}

export function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Library') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'People') {
              iconName = focused ? 'people' : 'people-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStackNavigator}
          options={{ title: 'Home' }}
        />
        <Tab.Screen 
          name="Library" 
          component={LibraryStackNavigator}
          options={{ title: 'Library' }}
        />
        <Tab.Screen 
          name="People" 
          component={PeopleStackNavigator}
          options={{ title: 'People' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

