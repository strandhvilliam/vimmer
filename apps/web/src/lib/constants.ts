export const PARTICIPANT_SUBMISSION_STEPS = {
  ParticipantNumberStep: 1,
  ParticipantDetailsStep: 2,
  ClassSelectionStep: 3,
  DeviceSelectionStep: 4,
  UploadSubmissionStep: 5,
} as const;

export const PARTICIPANT_REF_LENGTH = 4;

export const COMMON_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "heic",
  "heif",
  "png",
  "gif",
  "bmp",
  "tiff",
  "webp",
  "svg",
  "cr2",
  "nef",
  "arw",
  "raf",
  "dng",
  "orf",
  "pef",
  "srw",
];

export const UPLOAD_PHASE = {
  PRESIGNED: "presigned",
  S3_UPLOAD: "s3_upload",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
} as const;

export const FILE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
};

export const PARTICIPANT_STATUS = {
  INITIALIZED: "initialized",
  READY_TO_UPLOAD: "ready_to_upload",
  PROCESSING: "processing",
  COMPLETED: "completed",
  VERIFIED: "verified",
} as const;
