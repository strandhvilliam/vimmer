import { createSerializer, parseAsInteger, parseAsString } from "nuqs";

export const submissionQueryClientParams = {
  competitionClassId: parseAsInteger,
  deviceGroupId: parseAsInteger,
  participantId: parseAsInteger,
  participantRef: parseAsString,
  participantEmail: parseAsString,
  participantFirstName: parseAsString,
  participantLastName: parseAsString,
};

export const submissionQueryClientParamSerializer = createSerializer(
  submissionQueryClientParams,
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
