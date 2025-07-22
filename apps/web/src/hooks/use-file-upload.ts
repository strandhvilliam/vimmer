import {
  PhotoWithPresignedUrl,
  FileState,
  UploadResult,
  FileUploadError,
  FileUploadErrorCode,
} from "@/lib/types";
import posthog from "posthog-js";
import { useState, useCallback } from "react";
import { toast } from "sonner";

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB default

// File validation helper
const validateFile = (file: File): FileUploadError | null => {
  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File too large - maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
      code: "FILE_TOO_LARGE",
      timestamp: new Date(),
      retryable: false,
    };
  }

  // File type validation (basic check)
  if (!file.type.startsWith("image/")) {
    return {
      message: "Invalid file type - only images are allowed",
      code: "INVALID_FILE_TYPE",
      timestamp: new Date(),
      retryable: false,
    };
  }

  return null;
};

// Error classification helper
const classifyError = (
  error: Error,
  httpStatus?: number,
): { code: FileUploadErrorCode; retryable: boolean } => {
  const message = error.message.toLowerCase();

  // HTTP status code based classification
  if (httpStatus) {
    if (httpStatus === 413) return { code: "FILE_TOO_LARGE", retryable: false };
    if (httpStatus === 403) return { code: "UNAUTHORIZED", retryable: true };
    if (httpStatus === 429) return { code: "RATE_LIMITED", retryable: true };
    if (httpStatus >= 500) return { code: "SERVER_ERROR", retryable: true };
  }

  // Error name/message based classification
  if (error.name === "AbortError") return { code: "TIMEOUT", retryable: true };
  if (message.includes("network") || message.includes("fetch"))
    return { code: "NETWORK_ERROR", retryable: true };
  if (message.includes("timeout")) return { code: "TIMEOUT", retryable: true };
  if (message.includes("too large") || message.includes("413"))
    return { code: "FILE_TOO_LARGE", retryable: false };
  if (message.includes("forbidden") || message.includes("403"))
    return { code: "UNAUTHORIZED", retryable: true };
  if (message.includes("rate limit") || message.includes("429"))
    return { code: "RATE_LIMITED", retryable: true };

  return { code: "UNKNOWN", retryable: true };
};

export function useFileUpload() {
  const [fileStates, setFileStates] = useState<Map<string, FileState>>(
    new Map(),
  );
  const [isUploading, setIsUploading] = useState(false);

  const uploadSingleFile = async (
    file: FileState,
    retryCount = 0,
  ): Promise<FileState> => {
    // Pre-upload validation
    const validationError = validateFile(file.file);
    if (validationError) {
      return {
        ...file,
        status: "error" as const,
        error: validationError,
        retryCount,
      };
    }

    // Setup timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(file.presignedUrl, {
        method: "PUT",
        body: file.file,
        signal: controller.signal,
        headers: {
          "Content-Type": file.file.type,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(
          `Upload failed: ${response.status} ${response.statusText}`,
        );
        const { code, retryable } = classifyError(error, response.status);

        return {
          ...file,
          status: "error" as const,
          error: {
            message: error.message,
            code,
            timestamp: new Date(),
            retryable,
            httpStatus: response.status,
          },
          retryCount,
        };
      }

      return {
        ...file,
        status: "completed" as const,
        error: undefined,
        retryCount,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      const err =
        error instanceof Error ? error : new Error("Unknown upload error");
      const { code, retryable } = classifyError(err);

      return {
        ...file,
        status: "error" as const,
        error: {
          message: err.message,
          code,
          timestamp: new Date(),
          retryable,
        },
        retryCount,
      };
    }
  };

  const executeUpload = async (
    photos: PhotoWithPresignedUrl[],
  ): Promise<UploadResult> => {
    setIsUploading(true);

    // Initialize file states
    const initialStates = new Map<string, FileState>();
    photos.forEach((photo) => {
      initialStates.set(photo.key, {
        ...photo,
        status: "uploading",
        retryCount: 0,
      });
    });
    setFileStates(initialStates);

    try {
      // Upload all files concurrently but handle failures individually
      const uploadPromises = photos.map(async (photo) => {
        const fileState = initialStates.get(photo.key)!;
        return uploadSingleFile(fileState);
      });

      const results = await Promise.allSettled(uploadPromises);
      const finalStates = new Map<string, FileState>();
      const failedFiles: FileState[] = [];
      const successfulFiles: FileState[] = [];

      results.forEach((result, index) => {
        const photo = photos[index];
        if (!photo) return;

        if (result.status === "fulfilled") {
          finalStates.set(photo.key, result.value);
          if (result.value.status === "completed") {
            successfulFiles.push(result.value);
          } else {
            failedFiles.push(result.value);
          }
        } else {
          // This shouldn't happen with our error handling, but just in case
          const errorState: FileState = {
            ...photo,
            status: "error",
            error: {
              message: "Unexpected upload failure",
              code: "UNKNOWN",
              timestamp: new Date(),
              retryable: true,
            },
            retryCount: 0,
          };
          finalStates.set(photo.key, errorState);
          failedFiles.push(errorState);
        }
      });

      setFileStates(finalStates);

      // Show appropriate toast messages
      if (successfulFiles.length === 0) {
        toast.error(`All uploads failed. Check your connection and try again.`);
      } else if (failedFiles.length !== 0) {
        toast.warning(
          `${successfulFiles.length} uploaded, ${failedFiles.length} failed. You can retry the failed uploads.`,
        );
      }

      // Track analytics
      posthog.capture("file_upload_completed", {
        total_files: photos.length,
        successful_files: successfulFiles.length,
        failed_files: failedFiles.length,
      });

      return {
        success: failedFiles.length === 0,
        failedFiles,
        successfulFiles,
      };
    } catch (error) {
      console.error("Upload execution error:", error);
      posthog.captureException(error);
      toast.error("Upload process failed unexpectedly");

      return {
        success: false,
        failedFiles: photos.map((photo) => ({
          ...photo,
          status: "error" as const,
          error: {
            message: "Upload process failed",
            code: "UNKNOWN" as const,
            timestamp: new Date(),
            retryable: true,
          },
          retryCount: 0,
        })),
        successfulFiles: [],
      };
    } finally {
      setIsUploading(false);
    }
  };

  const retryFailedUploads = useCallback(
    async (failedFiles: FileState[]): Promise<UploadResult> => {
      if (failedFiles.length === 0)
        return { success: true, failedFiles: [], successfulFiles: [] };

      // Filter out non-retryable errors
      const retryableFiles = failedFiles.filter(
        (file) => file.error?.retryable !== false,
      );
      const nonRetryableFiles = failedFiles.filter(
        (file) => file.error?.retryable === false,
      );

      if (retryableFiles.length === 0) {
        toast.error("No files can be retried - all errors are permanent");
        return {
          success: false,
          failedFiles: nonRetryableFiles,
          successfulFiles: [],
        };
      }

      setIsUploading(true);

      // Update states to show retrying
      setFileStates((prev) => {
        const updated = new Map(prev);
        retryableFiles.forEach((file) => {
          updated.set(file.key, {
            ...file,
            status: "uploading",
            retryCount: (file.retryCount || 0) + 1,
          });
        });
        return updated;
      });

      try {
        const retryPromises = retryableFiles.map(async (file) => {
          const retryCount = (file.retryCount || 0) + 1;
          return uploadSingleFile(file, retryCount);
        });

        const results = await Promise.allSettled(retryPromises);
        const stillFailedFiles: FileState[] = [];
        const nowSuccessfulFiles: FileState[] = [];

        results.forEach((result, index) => {
          const originalFile = retryableFiles[index];
          if (!originalFile) return;

          if (result.status === "fulfilled") {
            setFileStates((prev) => {
              const updated = new Map(prev);
              updated.set(originalFile.key, result.value);
              return updated;
            });

            if (result.value.status === "completed") {
              nowSuccessfulFiles.push(result.value);
            } else {
              stillFailedFiles.push(result.value);
            }
          }
        });

        // Show appropriate feedback
        if (stillFailedFiles.length === 0) {
          toast.success(
            `All ${nowSuccessfulFiles.length} retried uploads succeeded!`,
          );
        } else if (nowSuccessfulFiles.length === 0) {
          toast.error(`All retry attempts failed. Check your connection.`);
        } else {
          toast.warning(
            `${nowSuccessfulFiles.length} succeeded on retry, ${stillFailedFiles.length} still failed.`,
          );
        }

        return {
          success: stillFailedFiles.length === 0,
          failedFiles: stillFailedFiles,
          successfulFiles: nowSuccessfulFiles,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const getFileState = useCallback(
    (key: string): FileState | undefined => {
      return fileStates.get(key);
    },
    [fileStates],
  );

  const getFailedFiles = useCallback((): FileState[] => {
    return Array.from(fileStates.values()).filter(
      (file) => file.status === "error",
    );
  }, [fileStates]);

  const retrySingleFile = useCallback(
    async (fileKey: string): Promise<void> => {
      const fileState = fileStates.get(fileKey);
      if (!fileState || fileState.status !== "error") {
        return;
      }

      // Check if the error is retryable
      if (fileState.error?.retryable === false) {
        toast.error("This file cannot be retried - the error is permanent");
        return;
      }

      setIsUploading(true);

      // Update state to show retrying
      setFileStates((prev) => {
        const updated = new Map(prev);
        updated.set(fileKey, {
          ...fileState,
          status: "uploading",
          retryCount: (fileState.retryCount || 0) + 1,
        });
        return updated;
      });

      try {
        const retryCount = (fileState.retryCount || 0) + 1;
        const result = await uploadSingleFile(fileState, retryCount);

        setFileStates((prev) => {
          const updated = new Map(prev);
          updated.set(fileKey, result);
          return updated;
        });

        if (result.status === "completed") {
          toast.success("File uploaded successfully!");
        } else {
          toast.error("Retry failed - please try again");
        }
      } finally {
        setIsUploading(false);
      }
    },
    [fileStates],
  );

  return {
    isUploading,
    fileStates: Array.from(fileStates.values()),
    executeUpload,
    retryFailedUploads,
    retrySingleFile,
    getFileState,
    getFailedFiles,
  };
}
