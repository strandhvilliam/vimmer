import { TabsContent } from "@vimmer/ui/components/tabs";
import React from "react";
import { SubmissionsParticipantsTable } from "./submissions-participants-table";
import { Participant, ValidationError } from "@vimmer/supabase/types";

const MOCK_PARTICIPANTS: (Participant & {
  validationErrors: ValidationError[];
})[] = [
  {
    id: 1,
    competitionClassId: 1,
    createdAt: "2024-01-01",
    deviceGroupId: 1,
    domain: "example.com",
    email: "alice@example.com",
    marathonId: 1,
    reference: "P001",
    status: "complete",
    updatedAt: "2024-01-01",
    uploadCount: 1,
    validationErrors: [
      {
        id: 1,
        createdAt: "2024-01-01",
        dismissed: false,
        message: "Image size too small",
        participantId: 1,
        severity: "warning",
        submissionId: 1,
      },
    ],
  },
  {
    id: 2,
    competitionClassId: 2,
    createdAt: "2024-01-01",
    deviceGroupId: null,
    domain: "example.com",
    email: "bob@example.com",
    marathonId: 2,
    reference: "P002",
    status: "incomplete",
    updatedAt: "2024-01-01",
    uploadCount: 0,
    validationErrors: [
      {
        id: 2,
        createdAt: "2024-01-01",
        dismissed: false,
        message: "Missing EXIF data",
        participantId: 2,
        severity: "error",
        submissionId: 2,
      },
    ],
  },
  {
    id: 3,
    competitionClassId: 1,
    createdAt: "2024-01-01",
    deviceGroupId: 2,
    domain: "example.com",
    email: "charlie@example.com",
    marathonId: 1,
    reference: "P003",
    status: "not_started",
    updatedAt: "2024-01-01",
    uploadCount: 0,
    validationErrors: [
      {
        id: 3,
        createdAt: "2024-01-01",
        dismissed: false,
        message: "Image may contain AI-generated content",
        participantId: 3,
        severity: "ai_suspicion",
        submissionId: 3,
      },
    ],
  },
  {
    id: 4,
    competitionClassId: 1,
    createdAt: "2024-01-01",
    deviceGroupId: 1,
    domain: "example.com",
    email: "david@example.com",
    marathonId: 1,
    reference: "P004",
    status: "complete",
    updatedAt: "2024-01-01",
    uploadCount: 3,
    validationErrors: [],
  },
];

async function getParticipants() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return MOCK_PARTICIPANTS;
}

export default async function SubmissionsParticipantsTab() {
  const participants = await getParticipants();
  return <SubmissionsParticipantsTable participants={participants} />;
}
