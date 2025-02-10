import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export function useSubmissionQueryState() {
  const [params, setParams] = useQueryStates(
    {
      competitionClassId: parseAsInteger,
      deviceGroupId: parseAsInteger,
      participantId: parseAsInteger,
      participantRef: parseAsString,
    },
    {
      urlKeys: {
        competitionClassId: "cc",
        deviceGroupId: "dg",
        participantId: "pid",
        participantRef: "pr",
      },
    },
  );

  return { params, setParams };
}
