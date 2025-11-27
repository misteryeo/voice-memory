import { OPENAI_API_KEY } from '../config/env';

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
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

    // Call OpenAI Whisper API directly with fetch
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}
