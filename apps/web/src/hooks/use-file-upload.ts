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

const DEFAULT_TIMEOUT = 1000 * 60 * 3; // 3 minutes

export function useFileUpload() {
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
        refetchInterval: 5000,
        enabled: !!participantId && isUploading,
      },
    ),
  );

  // Update file phases based on submission status changes
  useEffect(() => {
    if (submissions && isUploading) {
      submissions.forEach((submission) => {
        const file = getFile(submission.key);
        if (!file) return;

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

  const uploadSingleFile = async (file: UploadFileState): Promise<void> => {
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
      const uploadPromises = photos.map(async (photo) => {
        const file = getFile(photo.key);
        if (file) {
          await uploadSingleFile(file);
        }
      });

      await Promise.allSettled(uploadPromises);

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

    failedFiles.forEach((file) => {
      resetFileForRetry(file.key);
      incrementRetryCount(file.key);
    });

    try {
      const submissionUpdates = failedFiles.map((file) => ({
        id: file.submissionId,
        data: { status: "pending" as const },
      }));

      await updateMultipleSubmissions(submissionUpdates);

      // Upload failed files concurrently
      const uploadPromises = failedFiles.map(async (failedFile) => {
        const file = getFile(failedFile.key);
        if (file) {
          await uploadSingleFile(file);
        }
      });

      await Promise.allSettled(uploadPromises);

      const newFailedFiles = getFailedFiles();
      const retriedSuccessfully = failedFiles.length - newFailedFiles.length;

      posthog.capture("file_upload_retry", {
        total_retried: failedFiles.length,
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
