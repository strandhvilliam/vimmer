import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  PhotoWithPresignedUrl,
  FileUploadError,
  FileUploadErrorCode,
  UploadPhase,
} from "@/lib/types";
import { UPLOAD_PHASE } from "../constants";

export interface UploadFileState {
  // File info
  key: string;
  submissionId: number;
  orderIndex: number;
  file: File;
  presignedUrl: string;
  exif: { [key: string]: unknown };
  preview: string;

  // Upload state
  phase: UploadPhase;
  progress: number; // 0-100 for S3 upload progress
  error?: FileUploadError;
  retryCount: number; // Number of retry attempts

  // Timestamps
  startedAt?: Date;
  s3CompletedAt?: Date;
  completedAt?: Date;
}

interface UploadStore {
  // State
  files: Map<string, UploadFileState>;
  isUploading: boolean;
  participantId?: number;

  // Actions
  initializeFiles: (
    photos: PhotoWithPresignedUrl[],
    participantId: number,
  ) => void;
  updateFilePhase: (key: string, phase: UploadPhase, progress?: number) => void;
  setFileError: (key: string, error: FileUploadError) => void;
  setFileProgress: (key: string, progress: number) => void;
  setIsUploading: (uploading: boolean) => void;
  clearFiles: () => void;
  resetFileForRetry: (key: string) => void;
  incrementRetryCount: (key: string) => void;

  // Selectors
  getFile: (key: string) => UploadFileState | undefined;
  getFailedFiles: () => UploadFileState[];
  getAllFiles: () => UploadFileState[];
}

export const useUploadStore = create<UploadStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    files: new Map(),
    isUploading: false,
    participantId: undefined,

    // Actions
    initializeFiles: (
      photos: PhotoWithPresignedUrl[],
      participantId: number,
    ) => {
      const fileMap = new Map<string, UploadFileState>();

      photos.forEach((photo) => {
        fileMap.set(photo.key, {
          key: photo.key,
          submissionId: photo.submissionId,
          orderIndex: photo.orderIndex,
          file: photo.file,
          presignedUrl: photo.presignedUrl,
          exif: photo.exif,
          preview: photo.preview,
          phase: UPLOAD_PHASE.PRESIGNED,
          progress: 0,
          retryCount: 0,
          startedAt: new Date(),
        });
      });

      set({ files: fileMap, participantId, isUploading: true });
    },

    updateFilePhase: (key: string, phase: UploadPhase, progress?: number) => {
      set((state) => {
        const newFiles = new Map(state.files);
        const file = newFiles.get(key);

        if (file) {
          const updatedFile: UploadFileState = {
            ...file,
            phase,
            progress: progress ?? file.progress,
            error: phase === UPLOAD_PHASE.ERROR ? file.error : undefined,
          };

          // Set timestamps based on phase
          if (phase === UPLOAD_PHASE.S3_UPLOAD && !file.startedAt) {
            updatedFile.startedAt = new Date();
          } else if (phase === UPLOAD_PHASE.PROCESSING && !file.s3CompletedAt) {
            updatedFile.s3CompletedAt = new Date();
            updatedFile.progress = 100; // S3 upload is complete
          } else if (phase === UPLOAD_PHASE.COMPLETED && !file.completedAt) {
            updatedFile.completedAt = new Date();
            updatedFile.progress = 100;
          }

          newFiles.set(key, updatedFile);
        }

        return { files: newFiles };
      });
    },

    setFileError: (key: string, error: FileUploadError) => {
      set((state) => {
        const newFiles = new Map(state.files);
        const file = newFiles.get(key);

        if (file) {
          newFiles.set(key, {
            ...file,
            phase: UPLOAD_PHASE.ERROR,
            error,
          });
        }

        return { files: newFiles };
      });
    },

    setFileProgress: (key: string, progress: number) => {
      set((state) => {
        const newFiles = new Map(state.files);
        const file = newFiles.get(key);

        if (file && file.phase === UPLOAD_PHASE.S3_UPLOAD) {
          newFiles.set(key, {
            ...file,
            progress: Math.min(100, Math.max(0, progress)),
          });
        }

        return { files: newFiles };
      });
    },

    setIsUploading: (uploading: boolean) => {
      set({ isUploading: uploading });
    },

    clearFiles: () => {
      set({ files: new Map(), isUploading: false, participantId: undefined });
    },

    resetFileForRetry: (key: string) => {
      set((state) => {
        const newFiles = new Map(state.files);
        const file = newFiles.get(key);

        if (file && file.phase === UPLOAD_PHASE.ERROR) {
          newFiles.set(key, {
            ...file,
            phase: UPLOAD_PHASE.PRESIGNED,
            progress: 0,
            error: undefined,
            startedAt: new Date(),
            s3CompletedAt: undefined,
            completedAt: undefined,
          });
        }

        return { files: newFiles };
      });
    },

    incrementRetryCount: (key: string) => {
      set((state) => {
        const newFiles = new Map(state.files);
        const file = newFiles.get(key);

        if (file) {
          newFiles.set(key, {
            ...file,
            retryCount: file.retryCount + 1,
          });
        }

        return { files: newFiles };
      });
    },

    // Selectors
    getFile: (key: string) => {
      return get().files.get(key);
    },

    getFailedFiles: () => {
      return Array.from(get().files.values()).filter(
        (file) => file.phase === UPLOAD_PHASE.ERROR,
      );
    },

    getAllFiles: () => {
      return Array.from(get().files.values());
    },
  })),
);

// Helper function to classify errors
export const classifyError = (
  error: Error,
  httpStatus?: number,
): { code: FileUploadErrorCode } => {
  const message = error.message.toLowerCase();
  console.error(message);

  // HTTP status code based classification
  if (httpStatus) {
    if (httpStatus === 413) return { code: "FILE_TOO_LARGE" };
    if (httpStatus === 403) return { code: "UNAUTHORIZED" };
    if (httpStatus === 429) return { code: "RATE_LIMITED" };
    if (httpStatus >= 500) return { code: "SERVER_ERROR" };
  }

  // Error name/message based classification
  if (error.name === "AbortError") return { code: "TIMEOUT" };
  if (message.includes("network") || message.includes("fetch"))
    return { code: "NETWORK_ERROR" };
  if (message.includes("timeout")) return { code: "TIMEOUT" };
  if (message.includes("too large") || message.includes("413"))
    return { code: "FILE_TOO_LARGE" };
  if (message.includes("forbidden") || message.includes("403"))
    return { code: "UNAUTHORIZED" };
  if (message.includes("rate limit") || message.includes("429"))
    return { code: "RATE_LIMITED" };

  return { code: "UNKNOWN" };
};
