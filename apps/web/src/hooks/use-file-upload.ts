import { PhotoWithPresignedUrl, UploadResult } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  useUploadStore,
  classifyError,
  UploadFileState,
} from "@/lib/stores/upload-store";
import { useSubmissionQueryState } from "./use-submission-query-state";
import { FILE_STATUS, UPLOAD_PHASE } from "@/lib/constants";
import { useSubmissionRealtime } from "@/contexts/use-submissions-realtime";

const DEFAULT_TIMEOUT = 1000 * 60 * 6; // 6 minutes
const UPLOAD_CONCURRENCY_LIMIT = 1;

// Utility function to split array into chunks
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function useFileUpload({
  realtimeConfig,
}: {
  realtimeConfig: {
    endpoint: string;
    authorizer: string;
    topic: string;
  };
}) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();

  const {
    initializeFiles,
    updateFilePhase,
    setFileError,
    clearFiles,
    getFile,
    getFailedFiles,
    getAllFiles,
    isUploading,
    resetFileForRetry,
    incrementRetryCount,
  } = useUploadStore();

  const { mutateAsync: updateMultipleSubmissions } = useMutation(
    trpc.submissions.updateMultipleByIds.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.submissions.pathKey(),
        });
      },
    }),
  );

  const { data: submissions } = useQuery(
    trpc.submissions.getByParticipantId.queryOptions(
      {
        participantId: participantId ?? -1,
      },
      {
        refetchInterval: 10000,
        enabled: !!participantId && isUploading,
      },
    ),
  );

  useSubmissionRealtime({
    participantId: participantId ?? undefined,
    realtimeConfig,
    onEvent: (payload) => {
      if (!payload.key || Object.keys(payload.key).length === 0) return;
      const file = getFile(payload.key);
      if (!file) return;

      //Skip updates if file is currently being processed to prevent race conditions
      if (isFileLocked(payload.key)) return;

      if (
        payload.status === "uploaded" &&
        file.phase !== UPLOAD_PHASE.COMPLETED
      ) {
        updateFilePhase(payload.key, UPLOAD_PHASE.COMPLETED);
      } else if (
        payload.status === "error" &&
        file.phase !== UPLOAD_PHASE.ERROR
      ) {
        setFileError(payload.key, {
          message: "Processing failed on server",
          code: "SERVER_ERROR",
          timestamp: new Date(),
        });
      } else if (
        payload.status === "processing" &&
        file.phase === UPLOAD_PHASE.S3_UPLOAD &&
        file.progress === 100
      ) {
        updateFilePhase(payload.key, UPLOAD_PHASE.PROCESSING);
      }
    },
  });

  // Update file phases based on submission status changes
  useEffect(() => {
    if (submissions && isUploading) {
      submissions.forEach((submission) => {
        const file = getFile(submission.key);
        if (!file) return;

        // Skip updates if file is currently being processed to prevent race conditions
        if (isFileLocked(submission.key)) return;

        if (
          submission.status === "uploaded" &&
          file.phase !== UPLOAD_PHASE.COMPLETED
        ) {
          updateFilePhase(submission.key, UPLOAD_PHASE.COMPLETED);
        } else if (
          submission.status === "error" &&
          file.phase !== UPLOAD_PHASE.ERROR
        ) {
          setFileError(submission.key, {
            message: "Processing failed on server",
            code: "SERVER_ERROR",
            timestamp: new Date(),
          });
        } else if (
          submission.status === "processing" &&
          file.phase === UPLOAD_PHASE.S3_UPLOAD &&
          file.progress === 100
        ) {
          updateFilePhase(submission.key, UPLOAD_PHASE.PROCESSING);
        }
      });
    }
  }, [submissions, isUploading, getFile, updateFilePhase, setFileError]);

  // File locking mechanism to prevent race conditions
  const fileLocks = new Map<string, boolean>();
  const lockFile = (key: string) => fileLocks.set(key, true);
  const unlockFile = (key: string) => fileLocks.delete(key);
  const isFileLocked = (key: string) => fileLocks.has(key);

  const uploadSingleFile = async (file: UploadFileState): Promise<void> => {
    // Check if file is already being processed
    if (isFileLocked(file.key)) {
      return;
    }

    lockFile(file.key);

    try {
      updateFilePhase(file.key, UPLOAD_PHASE.S3_UPLOAD, 0);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        posthog.captureException("file upload timeout", {
          file: file.key,
          size: file.file.size,
        });
        controller.abort();
      }, DEFAULT_TIMEOUT);

      try {
        const response = await fetch(file.presignedUrl, {
          method: "PUT",
          body: file.file,
          signal: controller.signal,
          headers: {
            // "Content-Type": file.file.type,
            "Content-Type": "image/jpeg",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = new Error(
            `Upload failed: ${response.status} ${response.statusText} filesize: ${file.file.size}`,
          );
          const { code } = classifyError(error, response.status);

          setFileError(file.key, {
            message: error.message,
            code,
            timestamp: new Date(),
            httpStatus: response.status,
          });
          return;
        }

        updateFilePhase(file.key, UPLOAD_PHASE.PROCESSING, 100);
      } catch (error) {
        clearTimeout(timeoutId);

        const err =
          error instanceof Error ? error : new Error("Unknown upload error");
        const { code } = classifyError(err);

        setFileError(file.key, {
          message: err.message,
          code,
          timestamp: new Date(),
        });
      }
    } finally {
      unlockFile(file.key);
    }
  };

  // Controlled concurrency upload function
  const uploadWithConcurrencyLimit = async (
    files: UploadFileState[],
  ): Promise<void> => {
    const fileChunks = chunk(files, UPLOAD_CONCURRENCY_LIMIT);

    for (const fileChunk of fileChunks) {
      const uploadPromises = fileChunk.map(uploadSingleFile);
      await Promise.allSettled(uploadPromises);
    }
  };

  const executeUpload = async (
    photos: PhotoWithPresignedUrl[],
  ): Promise<UploadResult> => {
    if (!participantId) {
      toast.error("No participant ID found");
      return { success: false, failedFiles: [], successfulFiles: [] };
    }

    initializeFiles(photos, participantId);

    try {
      // Get all files to upload
      const filesToUpload = photos
        .map((photo) => getFile(photo.key))
        .filter((file): file is UploadFileState => file !== undefined);

      // Use controlled concurrency instead of uploading all files at once
      await uploadWithConcurrencyLimit(filesToUpload);

      // Get final results
      const failedFiles = getFailedFiles();
      const allFiles = getAllFiles();

      const completedFiles = allFiles.filter(
        (f) => f.phase === UPLOAD_PHASE.COMPLETED,
      );
      const processingFiles = allFiles.filter(
        (f) => f.phase === UPLOAD_PHASE.PROCESSING,
      );
      const uploadedFiles = completedFiles.length + processingFiles.length;

      // Show appropriate toast messages
      if (uploadedFiles === 0) {
        toast.error(`All uploads failed. Check your connection and try again.`);
      } else if (failedFiles.length > 0) {
        if (processingFiles.length > 0) {
          toast.warning(
            `${uploadedFiles} uploaded (${processingFiles.length} processing), ${failedFiles.length} failed.`,
          );
        } else {
          toast.warning(
            `${uploadedFiles} uploaded, ${failedFiles.length} failed.`,
          );
        }
      }
      posthog.capture("file_upload_completed", {
        total_files: photos.length,
        successful_files: uploadedFiles,
        failed_files: failedFiles.length,
      });

      return {
        success: failedFiles.length === 0,
        failedFiles: failedFiles.map((f) => ({
          ...f,
          status: FILE_STATUS.ERROR,
        })),
        successfulFiles: [...completedFiles, ...processingFiles].map((f) => ({
          ...f,
          status:
            f.phase === UPLOAD_PHASE.COMPLETED
              ? FILE_STATUS.COMPLETED
              : FILE_STATUS.UPLOADING,
        })),
      };
    } catch (error) {
      console.error("Upload execution error:", error);
      posthog.captureException(error);
      toast.error("Upload process failed unexpectedly");

      return {
        success: false,
        failedFiles: photos.map((photo) => ({
          ...photo,
          status: FILE_STATUS.ERROR,
          error: {
            message: "Upload process failed",
            code: "UNKNOWN" as const,
            timestamp: new Date(),
          },
        })),
        successfulFiles: [],
      };
    }
  };

  const retryFailedFiles = async (): Promise<void> => {
    if (!participantId) {
      toast.error("No participant ID found");
      return;
    }

    const failedFiles = getFailedFiles();
    if (failedFiles.length === 0) {
      return;
    }

    // Filter out files that are currently being processed to prevent conflicts
    const retryableFiles = failedFiles.filter(
      (file) => !isFileLocked(file.key),
    );

    if (retryableFiles.length === 0) {
      return;
    }

    retryableFiles.forEach((file) => {
      resetFileForRetry(file.key);
      incrementRetryCount(file.key);
    });

    try {
      const submissionUpdates = retryableFiles.map((file) => ({
        id: file.submissionId,
        data: { status: "pending" as const },
      }));

      await updateMultipleSubmissions(submissionUpdates);

      // Get files to retry and upload with controlled concurrency
      const filesToRetry = retryableFiles
        .map((failedFile) => getFile(failedFile.key))
        .filter((file): file is UploadFileState => file !== undefined);

      await uploadWithConcurrencyLimit(filesToRetry);

      const newFailedFiles = getFailedFiles();
      const retriedSuccessfully = retryableFiles.length - newFailedFiles.length;

      posthog.capture("file_upload_retry", {
        total_retried: retryableFiles.length,
        successful_retries: retriedSuccessfully,
        failed_retries: newFailedFiles.length,
      });
    } catch (error) {
      console.error("Retry execution error:", error);
      posthog.captureException(error);
      toast.error("Retry process failed unexpectedly");
    }
  };

  return {
    isUploading,
    fileStates: getAllFiles().map((f) => ({
      ...f,
      status:
        f.phase === UPLOAD_PHASE.COMPLETED
          ? FILE_STATUS.COMPLETED
          : f.phase === UPLOAD_PHASE.ERROR
            ? FILE_STATUS.ERROR
            : f.phase === UPLOAD_PHASE.S3_UPLOAD
              ? FILE_STATUS.UPLOADING
              : FILE_STATUS.PENDING,
    })),
    executeUpload,
    getFileState: (key: string) => {
      const file = getFile(key);
      if (!file) return undefined;
      return {
        ...file,
        status:
          file.phase === UPLOAD_PHASE.COMPLETED
            ? FILE_STATUS.COMPLETED
            : file.phase === UPLOAD_PHASE.ERROR
              ? FILE_STATUS.ERROR
              : file.phase === UPLOAD_PHASE.S3_UPLOAD
                ? FILE_STATUS.UPLOADING
                : FILE_STATUS.PENDING,
      };
    },
    getFailedFiles: () =>
      getFailedFiles().map((f) => ({
        ...f,
        status: FILE_STATUS.ERROR,
      })),
    clearFiles,
    retryFailedFiles,
  };
}
