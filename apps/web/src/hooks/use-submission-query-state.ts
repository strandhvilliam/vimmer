import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

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
      },
    },
  );

  return { submissionState, setSubmissionState };
}
