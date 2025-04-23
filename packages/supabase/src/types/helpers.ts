export type ToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<ToCamelCase<U>>}`
  : S;

export type ToCamelCaseObject<T> =
  T extends Array<infer U>
    ? Array<ToCamelCaseObject<U>>
    : T extends object
      ? {
          [K in keyof T as K extends string
            ? ToCamelCase<K>
            : K]: ToCamelCaseObject<T[K]>;
        }
      : T;

export const PARTICIPANT_STATUS = {
  INITIALIZED: "initialized",
  READY_TO_UPLOAD: "ready_to_upload",
  PROCESSING: "processing",
  COMPLETED: "completed",
  VERIFIED: "verified",
} as const;

export type ParticipantStatus =
  (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS];

export const SUBMISSION_STATUS = {
  NOT_STARTED: "not_started",
  UPLOADED: "uploaded",
} as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];
