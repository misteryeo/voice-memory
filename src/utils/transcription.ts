/**
 * Mock transcription function
 * TODO: Replace with OpenAI Whisper API or similar service
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock transcription
  // In production, this would call the actual transcription API
  return "Had lunch with Sarah today at the new cafe downtown. We discussed the upcoming project deadline and she mentioned John might need help with the designs. Maya called later to check in on my health after the gym incident last week.";
}

