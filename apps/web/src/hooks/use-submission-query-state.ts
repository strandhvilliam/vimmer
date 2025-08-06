import {
  parseAsInteger,
  parseAsString,
  parseAsBoolean,
  useQueryStates,
} from "nuqs";

export function useSubmissionQueryState() {
  const [submissionState, setSubmissionState] = useQueryStates(
    {
      competitionClassId: parseAsInteger,
      deviceGroupId: parseAsInteger,
      participantId: parseAsInteger,
      participantRef: parseAsString,
      participantEmail: parseAsString,
      participantFirstName: parseAsString,
      participantLastName: parseAsString,
      uploadInstructionsShown: parseAsBoolean.withDefault(false),
    },
    {
      urlKeys: {
        competitionClassId: "cc",
        deviceGroupId: "dg",
        participantId: "pid",
        participantRef: "pr",
        participantEmail: "pe",
        participantFirstName: "pf",
        participantLastName: "pl",
        uploadInstructionsShown: "uis",
      },
    },
  );

  return { submissionState, setSubmissionState };
}
