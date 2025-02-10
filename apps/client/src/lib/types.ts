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
