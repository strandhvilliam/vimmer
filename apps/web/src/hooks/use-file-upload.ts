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

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export function useFileUpload() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();

  // Zustand store actions and selectors
  const {
    initializeFiles,
    updateFilePhase,
    setFileError,
    // setIsUploading,
    clearFiles,
    getFile,
    getFailedFiles,
    getAllFiles,
    getUploadProgress,
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

  // Query to listen for submission status changes
  const { data: submissions } = useQuery(
    trpc.submissions.getByParticipantId.queryOptions(
      {
        participantId: participantId ?? -1,
      },
      {
        refetchInterval: 2000,
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

        // Update phase based on submission status
        if (submission.status === "uploaded" && file.phase !== "completed") {
          updateFilePhase(submission.key, "completed");
        } else if (submission.status === "error" && file.phase !== "error") {
          setFileError(submission.key, {
            message: "Processing failed on server",
            code: "SERVER_ERROR",
            timestamp: new Date(),
          });
        } else if (
          submission.status === "processing" &&
          file.phase === "s3_upload" &&
          file.progress === 100
        ) {
          updateFilePhase(submission.key, "processing");
        }
      });

      // Check if all uploads are complete
      // const progress = getUploadProgress();
      // const allComplete =
      //   progress.completed + progress.failed === progress.total;

      // if (allComplete && isUploading) {
      //   setIsUploading(false);
      // }
    }
  }, [
    submissions,
    isUploading,
    getFile,
    updateFilePhase,
    setFileError,
    getUploadProgress,
  ]);

  const uploadSingleFile = async (file: UploadFileState): Promise<void> => {
    // Update to uploading phase
    updateFilePhase(file.key, "s3_upload", 0);

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
        const { code } = classifyError(error, response.status);

        setFileError(file.key, {
          message: error.message,
          code,
          timestamp: new Date(),
          httpStatus: response.status,
        });
        return;
      }

      // S3 upload successful, move to processing phase
      updateFilePhase(file.key, "processing", 100);
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

    // Initialize files in store
    initializeFiles(photos, participantId);

    try {
      // Upload all files concurrently
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
      const completedFiles = allFiles.filter((f) => f.phase === "completed");
      const processingFiles = allFiles.filter((f) => f.phase === "processing");
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
      // Track analytics
      posthog.capture("file_upload_completed", {
        total_files: photos.length,
        successful_files: uploadedFiles,
        failed_files: failedFiles.length,
      });

      return {
        success: failedFiles.length === 0,
        failedFiles: failedFiles.map((f) => ({
          ...f,
          status: "error" as const,
        })),
        successfulFiles: [...completedFiles, ...processingFiles].map((f) => ({
          ...f,
          status:
            f.phase === "completed"
              ? ("completed" as const)
              : ("uploading" as const), // Show processing files as uploading
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
          status: "error" as const,
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

    // setIsUploading(true);

    // Reset failed files for retry and increment retry count
    failedFiles.forEach((file) => {
      resetFileForRetry(file.key);
      incrementRetryCount(file.key);
    });

    try {
      // First, reset submission status to "pending" for failed files
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

      // Get final results after retry
      const newFailedFiles = getFailedFiles();
      const allFiles = getAllFiles();
      const completedFiles = allFiles.filter((f) => f.phase === "completed");
      const processingFiles = allFiles.filter((f) => f.phase === "processing");
      const retriedSuccessfully = failedFiles.length - newFailedFiles.length;

      // Track analytics
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

    // Check if all uploads are complete after retry
    // const progress = getUploadProgress();
    // const allComplete = progress.completed + progress.failed === progress.total;

    // if (allComplete) {
    //   setIsUploading(false);
    // }
  };

  return {
    isUploading,
    fileStates: getAllFiles().map((f) => ({
      ...f,
      status:
        f.phase === "completed"
          ? ("completed" as const)
          : f.phase === "error"
            ? ("error" as const)
            : f.phase === "s3_upload"
              ? ("uploading" as const)
              : ("pending" as const),
    })),
    executeUpload,
    getFileState: (key: string) => {
      const file = getFile(key);
      if (!file) return undefined;
      return {
        ...file,
        status:
          file.phase === "completed"
            ? ("completed" as const)
            : file.phase === "error"
              ? ("error" as const)
              : file.phase === "s3_upload"
                ? ("uploading" as const)
                : ("pending" as const),
      };
    },
    getFailedFiles: () =>
      getFailedFiles().map((f) => ({
        ...f,
        status: "error" as const,
      })),
    clearFiles,
    retryFailedFiles,
  };
}
