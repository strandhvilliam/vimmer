"use server";

import { revalidatePath } from "next/cache";

interface ParticipantData {
  participantNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  submissions: number;
  warnings: string[];
}

export async function fetchParticipantData(
  identifier: string,
): Promise<ParticipantData> {
  // This is a mock implementation. Replace with actual API call.
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
  return {
    participantNumber: identifier,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    submissions: Math.floor(Math.random() * 24) + 1,
    warnings: [
      "Missing submission for category A",
      "Late submission for category B",
    ],
  };
}

export async function approveParticipant(
  participantNumber: string,
): Promise<void> {
  // This is a mock implementation. Replace with actual API call.
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
  console.log(`Participant ${participantNumber} approved`);
  revalidatePath("/");
}
