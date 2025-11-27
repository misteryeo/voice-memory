/**
 * Detects themes using keyword matching
 * TODO: Replace with semantic classification model or advanced NLP
 */

const THEME_KEYWORDS: Record<string, string[]> = {
  work: ['project', 'deadline', 'meeting', 'office', 'colleague', 'boss', 'client', 'presentation', 'report'],
  family: ['mom', 'dad', 'parent', 'sibling', 'brother', 'sister', 'family', 'home'],
  health: ['gym', 'workout', 'exercise', 'doctor', 'health', 'fitness', 'diet', 'medical'],
  travel: ['trip', 'vacation', 'flight', 'hotel', 'travel', 'journey', 'destination'],
  food: ['restaurant', 'cafe', 'lunch', 'dinner', 'breakfast', 'food', 'meal', 'cooking'],
  social: ['friend', 'party', 'event', 'gathering', 'social', 'hangout'],
  learning: ['study', 'course', 'book', 'learn', 'education', 'class', 'lesson'],
  hobbies: ['hobby', 'sport', 'game', 'music', 'art', 'reading', 'writing'],
};

export function detectThemes(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lowerText = text.toLowerCase();
  const detectedThemes: string[] = [];

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        if (!detectedThemes.includes(theme)) {
          detectedThemes.push(theme);
        }
        break; // Found a keyword for this theme, move to next theme
      }
    }
  }

  return detectedThemes;
}

