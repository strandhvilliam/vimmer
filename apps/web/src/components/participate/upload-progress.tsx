"use client";

import { useSubmissionsListener } from "@/hooks/use-submissions-listener";
import { FileState, PhotoWithPresignedUrl } from "@/lib/types";
import { Topic } from "@vimmer/api/db/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Button } from "@vimmer/ui/components/button";
import { Progress } from "@vimmer/ui/components/progress";
import { AnimatePresence, motion } from "motion/react";
import { FileProgressItem } from "@/components/participate/file-progress-item";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface UploadProgressProps {
  files: PhotoWithPresignedUrl[];
  fileStates: FileState[];
  topics: Topic[];
  expectedCount: number;
  onComplete: () => void;
  onRetryFailed: (failedFiles: FileState[]) => void;
  onRetrySingle: (fileKey: string) => void;
  isUploading: boolean;
  open?: boolean;
}

export function UploadProgress({
  files,
  fileStates,
  topics,
  expectedCount: expectedFilesCount,
  onComplete,
  onRetryFailed,
  onRetrySingle,
  isUploading,
  open = true,
}: UploadProgressProps) {
  const uploadedSubmissions = useSubmissionsListener({
    enabled: open,
  });

  // Merge file states with upload status
  const enhancedFileStates = files.map((file) => {
    const fileState = fileStates.find((fs) => fs.key === file.key);
    const isCompleted = uploadedSubmissions.includes(file.submissionId);

    return {
      ...file,
      status: isCompleted ? "completed" : fileState?.status || "pending",
      error: fileState?.error,
      retryCount: fileState?.retryCount || 0,
    } as FileState;
  });

  const completedFiles = enhancedFileStates.filter(
    (file) => file.status === "completed",
  );
  const failedFiles = enhancedFileStates.filter(
    (file) => file.status === "error",
  );
  const uploadingFiles = enhancedFileStates.filter(
    (file) => file.status === "uploading",
  );

  const progress = {
    percentage: (completedFiles.length / files.length) * 100,
    completed: completedFiles.length,
    total: files.length,
    failed: failedFiles.length,
    uploading: uploadingFiles.length,
  };

  const allUploadsComplete = progress.completed === expectedFilesCount;
  const hasFailures = failedFiles.length > 0;
  const canRetry = hasFailures && !isUploading;

  return (
    <Dialog open={open}>
      <DialogContent
        hideCloseButton
        className="p-0 border-none bg-transparent shadow-none max-w-md"
      >
        <DialogTitle className="sr-only">Uploading Photos</DialogTitle>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-xl font-rocgrotesk">
              {isUploading
                ? "Uploading Photos"
                : hasFailures
                  ? "Upload Issues"
                  : "Upload Complete"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>
                  {progress.completed} of {progress.total} completed
                  {progress.failed > 0 && (
                    <span className="text-destructive ml-1">
                      ({progress.failed} failed)
                    </span>
                  )}
                </span>
              </div>
              <Progress value={progress.percentage} />
            </div>

            {hasFailures && !isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">
                    {failedFiles.length} upload
                    {failedFiles.length === 1 ? "" : "s"} failed
                  </p>
                  <p className="text-muted-foreground">
                    Check your connection and try again
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {enhancedFileStates.map((file) => (
                  <FileProgressItem
                    key={file.key}
                    file={file}
                    topic={
                      topics.find(
                        (topic) => topic.orderIndex === file.orderIndex,
                      )!
                    }
                    onRetry={
                      canRetry && file.error?.retryable !== false
                        ? () => onRetrySingle(file.key)
                        : undefined
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {canRetry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <Button
                  onClick={() => onRetryFailed(failedFiles)}
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Failed Uploads ({failedFiles.length})
                </Button>
              </motion.div>
            )}

            {allUploadsComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[80%]"
              >
                <PrimaryButton
                  onClick={onComplete}
                  className="w-full text-lg rounded-full"
                >
                  Continue
                </PrimaryButton>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
