import {
  ValidationOutcome,
  RuleKey,
  SeverityLevel,
} from "@vimmer/validation/types";
import { FILE_STATUS, UPLOAD_PHASE } from "./constants";

export interface PresignedSubmission {
  presignedUrl: string;
  key: string;
  orderIndex: number;
  topicId: number;
  submissionId: number;
}

export interface SelectedPhotoV2 {
  file: File;
  exif: { [key: string]: unknown };
  preview: string;
  orderIndex: number;
}

export interface SelectedPhoto {
  file: File;
  exif: { [key: string]: unknown };
  preview: string;
  topicId: number;
  topicName: string;
  orderIndex: number;
  validationMessage?: string;
  validationOutcome?: ValidationOutcome;
  validationSeverity?: SeverityLevel;
  validationRuleKey?: RuleKey;
}

export interface PhotoWithPresignedUrl extends SelectedPhotoV2 {
  presignedUrl: string;
  key: string;
  submissionId: number;
}

export type FileStatus = (typeof FILE_STATUS)[keyof typeof FILE_STATUS];

export type FileUploadErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "FILE_TOO_LARGE"
  | "UNAUTHORIZED"
  | "SERVER_ERROR"
  | "RATE_LIMITED"
  | "INVALID_FILE_TYPE"
  | "UNKNOWN";

export interface FileUploadError {
  message: string;
  code: FileUploadErrorCode;
  timestamp: Date;
  httpStatus?: number;
}

export interface FileState extends PhotoWithPresignedUrl {
  status: FileStatus;
  error?: FileUploadError;
}

export interface UploadResult {
  success: boolean;
  failedFiles: FileState[];
  successfulFiles: FileState[];
}

export interface StepNavigationHandlers {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

export interface ConfirmationData {
  id: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  name: string;
  orderIndex: number;
  exif: Record<string, unknown>;
}

export type UploadPhase = (typeof UPLOAD_PHASE)[keyof typeof UPLOAD_PHASE];

export type ParticipantStatus =
  (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS];
