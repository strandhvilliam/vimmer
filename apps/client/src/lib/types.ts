export interface SelectedPhoto {
  file: File;
  preview: string;
  topicId: number;
  topicName: string;
  isValid?: boolean;
  validationMessage?: string;
}

export interface PhotoWithPresignedUrl extends SelectedPhoto {
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
