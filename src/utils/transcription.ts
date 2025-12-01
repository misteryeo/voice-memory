import { OPENAI_API_KEY } from '../config/env';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (network issues, timeouts, server errors)
 */
function isRetryableError(error: unknown, statusCode?: number): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('aborted') ||
      message.includes('fetch')
    ) {
      return true;
    }
  }
  // Retry on server errors (5xx) or rate limiting (429)
  if (statusCode && (statusCode >= 500 || statusCode === 429)) {
    return true;
  }
  return false;
}

/**
 * Transcribe audio using OpenAI Whisper API with retry logic
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create form data with the audio file
      const formData = new FormData();

      // In React Native, we can append a file URI directly
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      formData.append('model', 'whisper-1');

      // Call OpenAI Whisper API with timeout
      const response = await fetchWithTimeout(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: formData,
        },
        REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`OpenAI API error (attempt ${attempt}):`, errorData);

        // Check for specific error types
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI configuration.');
        }
        if (response.status === 429) {
          if (attempt < MAX_RETRIES) {
            console.log(`Rate limited, retrying in ${RETRY_DELAY_MS * attempt}ms...`);
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status >= 500) {
          if (attempt < MAX_RETRIES) {
            console.log(`Server error, retrying in ${RETRY_DELAY_MS * attempt}ms...`);
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          throw new Error('OpenAI service is temporarily unavailable. Please try again.');
        }

        throw new Error(`Transcription failed (error ${response.status})`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error(`Transcription error (attempt ${attempt}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this is a timeout/abort error
      if (lastError.name === 'AbortError' || lastError.message.includes('aborted')) {
        if (attempt < MAX_RETRIES) {
          console.log(`Request timed out, retrying (attempt ${attempt + 1})...`);
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        throw new Error('Request timed out. Please check your connection and try again.');
      }

      // Check if it's a retryable network error
      if (isRetryableError(error) && attempt < MAX_RETRIES) {
        console.log(`Network error, retrying in ${RETRY_DELAY_MS * attempt}ms...`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      // Non-retryable error or already has a specific message
      if (lastError.message.includes('API key') ||
          lastError.message.includes('Rate limit') ||
          lastError.message.includes('unavailable')) {
        throw lastError;
      }

      // Generic error on last attempt
      if (attempt === MAX_RETRIES) {
        throw new Error('Failed to transcribe audio. Please check your connection and try again.');
      }
    }
  }

  throw lastError || new Error('Failed to transcribe audio. Please try again.');
}
