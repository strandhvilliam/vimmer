import { MOCK_DATA, ParticipantData } from "./types";

// In a real application, this would fetch data from a database
export async function getParticipantData(
  participantId: string
): Promise<ParticipantData | null> {
  // Simulate a server delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Convert string ID to number for lookup in mock data
  const numericId = parseInt(participantId, 10);

  // Check if the ID exists in our mock data
  if (numericId in MOCK_DATA) {
    // We know it exists because we checked with 'in' operator
    return MOCK_DATA[numericId] as ParticipantData;
  }

  return null;
}
