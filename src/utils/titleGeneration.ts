import { OPENAI_API_KEY } from '../config/env';
import { generateEntryTitle } from './generateEntryTitle';

const TITLE_SYSTEM_PROMPT = `You will receive a diary-style voice or text transcription of a personal moment.
Your task is to generate a short, descriptive, emotionally aware title that summarizes what the moment was about.

Requirements:
- Maximum 6 words.
- Capture the core idea or emotional anchor.
- Avoid generic openings like 'I went' or 'I was'.
- Do not rewrite the whole moment; summarize it.
- Do not include names unless they matter to the story.
- Return only the title.`;

/**
 * Generates a title for an entry using OpenAI's gpt-4o-mini.
 * Falls back to heuristic generation if the API call fails.
 */
export async function generateAITitle(
  transcript: string,
  names?: string[]
): Promise<string> {
  if (!transcript || transcript.trim().length === 0) {
    return 'Untitled moment';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TITLE_SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
        max_tokens: 30,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim();

    if (!title) {
      throw new Error('Empty response from API');
    }

    return title;
  } catch (error) {
    console.error('Title generation error, falling back to heuristic:', error);
    return generateEntryTitle(transcript, names);
  }
}
