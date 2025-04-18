import { ValidationOutcome, RuleKey, SeverityLevel } from "@vimmer/validation";

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

export type FileStatus = "pending" | "uploading" | "completed" | "error";

export interface FileState extends PhotoWithPresignedUrl {
  status: FileStatus;
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
