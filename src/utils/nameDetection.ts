/**
 * Detects possible names in text using simple heuristics
 * Looks for capitalized words (2+ characters) that aren't common words
 * TODO: Replace with NLP-based entity extraction (e.g., spaCy, NER models)
 */

const COMMON_WORDS = new Set([
  'I', 'The', 'This', 'That', 'There', 'These', 'Those',
  'Today', 'Tomorrow', 'Yesterday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February',
  'March', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'New', 'Old', 'Good', 'Bad',
  'Big', 'Small', 'First', 'Last', 'Next', 'Previous'
]);

export function detectNames(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split text into words
  const words = text.split(/\s+/);
  const detectedNames: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    // Remove punctuation
    const cleanWord = word.replace(/[.,!?;:()"']/g, '');
    
    // Check if word is capitalized and 2+ characters
    if (
      cleanWord.length >= 2 &&
      cleanWord[0] === cleanWord[0].toUpperCase() &&
      cleanWord[0] !== cleanWord[0].toLowerCase() &&
      !COMMON_WORDS.has(cleanWord)
    ) {
      const lowerWord = cleanWord.toLowerCase();
      if (!seen.has(lowerWord)) {
        seen.add(lowerWord);
        detectedNames.push(cleanWord);
      }
    }
  }

  return detectedNames;
}

