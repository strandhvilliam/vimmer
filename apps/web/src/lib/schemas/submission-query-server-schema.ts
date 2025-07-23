import {
  createLoader,
  parseAsInteger,
  parseAsString,
  createSerializer,
} from "nuqs/server";

export const submissionQueryServerParams = {
  competitionClassId: parseAsInteger,
  deviceGroupId: parseAsInteger,
  participantId: parseAsInteger,
  participantRef: parseAsString,
  participantEmail: parseAsString,
  participantFirstName: parseAsString,
  participantLastName: parseAsString,
};

export const loadSubmissionQueryServerParams = createLoader(
  submissionQueryServerParams,
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

export const submissionQueryServerParamSerializer = createSerializer(
  submissionQueryServerParams,
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
