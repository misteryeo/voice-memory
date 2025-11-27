# Cortex Journal - Voice Memory MVP

A voice-first personal memory app built with React Native and Expo. Capture thoughts by voice or text, review transcriptions with detected people and themes, and browse your memory library.

## Features

- **Voice Recording**: Record audio notes using Expo AV
- **Text Input**: Type notes as an alternative to voice
- **AI-Mocked Transcription**: Simulated transcription with placeholder text (ready for real AI integration)
- **Name Detection**: Automatically detects capitalized names in entries
- **Theme Detection**: Keyword-based theme detection
- **Local Storage**: All entries stored locally using AsyncStorage
- **People Layer**: View all mentioned people with entry counts and details
- **Entry Library**: Browse and view all saved entries

## Project Structure

```
voice-memory/
├── src/
│   ├── navigation/       # Tab navigator and stack navigators
│   ├── screens/          # All app screens
│   ├── components/       # Reusable UI components
│   ├── utils/            # Utility functions (transcription, detection)
│   ├── storage/          # AsyncStorage helpers
│   ├── types/            # TypeScript interfaces
│   └── constants/        # App constants (colors, etc.)
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for Mac) or Expo Go app on your device

### Installation

1. Navigate to the project directory:
```bash
cd voice-memory
```

2. Install dependencies:
```bash
npm install
```

### Running the App

Start the Expo development server:
```bash
npx expo start
```

Then:
- Press `i` to open in iOS Simulator (requires Xcode)
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app on your device

### Development Mode

The app runs in development mode with:
- Hot reloading enabled
- Error messages displayed in the app
- Fast refresh for quick iteration

## Architecture

### Navigation

- **Bottom Tabs**: Home, Library, People
- **Home Stack**: Capture → Summary
- **Library Stack**: Library List → Entry Detail
- **People Stack**: People List → Person Detail

### Storage

All data is stored locally using `@react-native-async-storage/async-storage`. No backend required for MVP.

### Mock AI Functions

The app includes mock implementations for:
- **Transcription** (`src/utils/transcription.ts`): Returns placeholder text
- **Name Detection** (`src/utils/nameDetection.ts`): Regex-based capitalized word detection
- **Theme Detection** (`src/utils/themeDetection.ts`): Keyword matching

All mock functions include TODO markers for real AI integration.

## TODO: Future AI Integration

Replace mock functions with real APIs:
- `transcription.ts`: Integrate OpenAI Whisper API or similar
- `nameDetection.ts`: Use NLP entity extraction (spaCy, NER models)
- `themeDetection.ts`: Implement semantic classification

## Technologies Used

- React Native
- Expo (~54.0)
- TypeScript
- React Navigation v7
- Expo AV (audio recording)
- AsyncStorage (local storage)
- Expo Linear Gradient (avatars)

## Notes

- Audio recordings are stored as file URIs locally
- All timestamps are Unix timestamps (milliseconds)
- Entry IDs are generated using timestamp + random string
- People are extracted from entry names and aggregated automatically

