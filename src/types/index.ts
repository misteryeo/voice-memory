export interface Entry {
  id: string;
  type: 'voice' | 'text';
  audioPath?: string; // URI to audio file if voice entry
  transcription: string; // Text content (from voice or typed)
  names: string[]; // Confirmed people names
  themes: string[]; // Detected themes
  timestamp: number; // Unix timestamp
  textNote?: string; // Original text if typed entry
  title?: string; // AI-generated or user-edited title
}

export interface Person {
  name: string;
  firstMentioned: number; // Unix timestamp
  entryIds: string[]; // Array of entry IDs mentioning this person
  themes: string[]; // Common themes across their entries
}

