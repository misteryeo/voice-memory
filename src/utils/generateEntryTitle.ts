/**
 * Generates a meaningful title for an entry based on its transcription.
 * Uses simple heuristics to extract key phrases or meaningful words.
 */

// Context patterns that often precede meaningful content
const CONTEXT_PATTERNS = [
  /(?:met|met with|meeting with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /(?:talked|spoke|speaking|chatting)\s+(?:to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /(?:went|going|headed)\s+to\s+(?:the\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
  /(?:thought|thinking|wondered)\s+about\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:remembered|remembering)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:idea|realized|discovered)\s+(?:about|that|for)?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:working|worked)\s+on\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:finished|completed|done with)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:started|beginning|began)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:feeling|felt)\s+([A-Za-z]+)/i,
  /(?:need|needs|needed)\s+to\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  /(?:want|wants|wanted)\s+to\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
];

// Action verbs that make good title starters
const ACTION_VERBS = [
  'meeting', 'call', 'lunch', 'dinner', 'coffee', 'breakfast',
  'workout', 'run', 'walk', 'hike', 'trip', 'visit',
  'project', 'task', 'deadline', 'presentation', 'interview',
  'appointment', 'doctor', 'dentist', 'therapy',
  'birthday', 'anniversary', 'celebration', 'party',
  'grocery', 'shopping', 'errand', 'pickup',
  'flight', 'travel', 'vacation', 'hotel',
  'idea', 'thought', 'reflection', 'note', 'reminder',
];

// Words to skip when looking for meaningful content
const SKIP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your',
  'the', 'a', 'an', 'and', 'or', 'but', 'so', 'just',
  'was', 'is', 'are', 'were', 'been', 'be', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'can', 'may', 'might',
  'this', 'that', 'these', 'those', 'it', 'its',
  'very', 'really', 'quite', 'pretty', 'actually',
  'today', 'yesterday', 'tomorrow', 'now', 'then',
  'here', 'there', 'where', 'when', 'what', 'why', 'how',
  'like', 'just', 'also', 'too', 'well', 'okay', 'ok',
  'um', 'uh', 'hmm', 'yeah', 'yes', 'no', 'not',
  'got', 'get', 'getting', 'went', 'go', 'going',
  'said', 'say', 'says', 'saying', 'told', 'tell',
  'think', 'thought', 'know', 'knew', 'see', 'saw',
  'want', 'wanted', 'need', 'needed', 'make', 'made',
  'some', 'any', 'all', 'most', 'more', 'less',
  'about', 'with', 'from', 'into', 'over', 'after', 'before',
]);

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Extracts title from context patterns like "met with John" -> "Meeting with John"
 */
function extractFromContextPattern(text: string): string | null {
  for (const pattern of CONTEXT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      // Get the action word from the match
      const fullMatch = match[0].toLowerCase();

      if (fullMatch.includes('met') || fullMatch.includes('meeting')) {
        return `Meeting with ${capitalize(extracted)}`;
      }
      if (fullMatch.includes('talk') || fullMatch.includes('spoke') || fullMatch.includes('chat')) {
        return `Conversation with ${capitalize(extracted)}`;
      }
      if (fullMatch.includes('went') || fullMatch.includes('going') || fullMatch.includes('headed')) {
        return `Trip to ${capitalize(extracted)}`;
      }
      if (fullMatch.includes('thought') || fullMatch.includes('thinking') || fullMatch.includes('wondered')) {
        return `Thoughts on ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('remember')) {
        return `Memory: ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('idea') || fullMatch.includes('realized') || fullMatch.includes('discovered')) {
        return `Idea: ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('work')) {
        return `Working on ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('finish') || fullMatch.includes('completed') || fullMatch.includes('done')) {
        return `Completed ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('start') || fullMatch.includes('began') || fullMatch.includes('beginning')) {
        return `Starting ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('feel') || fullMatch.includes('felt')) {
        return `Feeling ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('need')) {
        return `Need to ${extracted.toLowerCase()}`;
      }
      if (fullMatch.includes('want')) {
        return `Want to ${extracted.toLowerCase()}`;
      }
    }
  }
  return null;
}

/**
 * Finds an action verb from the text
 */
function findActionVerb(words: string[]): string | null {
  for (const word of words) {
    const lower = word.toLowerCase();
    if (ACTION_VERBS.includes(lower)) {
      return capitalize(word);
    }
  }
  return null;
}

/**
 * Finds meaningful words (nouns/verbs) from the text
 */
function findMeaningfulWords(text: string): string[] {
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const meaningful: string[] = [];

  for (const word of words) {
    const lower = word.toLowerCase();
    if (!SKIP_WORDS.has(lower)) {
      meaningful.push(word);
      if (meaningful.length >= 3) break;
    }
  }

  return meaningful;
}

/**
 * Generates a title for an entry based on its transcription.
 *
 * @param transcription - The transcription text to analyze
 * @param names - Optional array of detected names to incorporate
 * @returns A generated title string
 */
export function generateEntryTitle(transcription: string, names?: string[]): string {
  if (!transcription || transcription.trim().length === 0) {
    return 'Untitled moment';
  }

  const text = transcription.trim();

  // 1. Try to extract from context patterns first
  const contextTitle = extractFromContextPattern(text);
  if (contextTitle) {
    return contextTitle;
  }

  // 2. If we have names, use them
  if (names && names.length > 0) {
    if (names.length === 1) {
      return `About ${names[0]}`;
    }
    return `About ${names[0]} and ${names.length > 2 ? 'others' : names[1]}`;
  }

  // 3. Look for action verbs
  const words = text.replace(/[^\w\s]/g, ' ').split(/\s+/);
  const actionVerb = findActionVerb(words);
  if (actionVerb) {
    return actionVerb;
  }

  // 4. Find meaningful words and create a title
  const meaningful = findMeaningfulWords(text);
  if (meaningful.length > 0) {
    // Capitalize first word, keep others as-is
    const title = meaningful.slice(0, 3).join(' ');
    return capitalize(title);
  }

  // 5. Fallback
  return 'Untitled moment';
}
