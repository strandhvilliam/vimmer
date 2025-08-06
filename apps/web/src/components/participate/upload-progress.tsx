"use client";

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
import { useUploadStore } from "@/lib/stores/upload-store";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useMemo } from "react";

interface UploadProgressProps {
  files?: PhotoWithPresignedUrl[];
  topics: Topic[];
  expectedCount: number;
  onComplete: () => void;
  open?: boolean;
}

export function UploadProgress({
  topics,
  expectedCount: expectedFilesCount,
  onComplete,
  open = true,
}: UploadProgressProps) {
  const files = useUploadStore((state) => state.files);
  const { retryFailedFiles } = useFileUpload();

  const enhancedFileStates: FileState[] = useMemo(() => {
    const fileStates = Array.from(files.values());
    return fileStates.map((f) => ({
      ...f,
      status:
        f.phase === "completed"
          ? ("completed" as const)
          : f.phase === "error"
            ? ("error" as const)
            : f.phase === "s3_upload"
              ? ("uploading" as const)
              : ("pending" as const),
    }));
  }, [files]);

  const progress = useMemo(() => {
    const fileStates = Array.from(files.values());
    const total = fileStates.length || expectedFilesCount;
    const completed = fileStates.filter((f) => f.phase === "completed").length;
    const failed = fileStates.filter((f) => f.phase === "error").length;
    const uploading = fileStates.filter((f) => f.phase === "s3_upload").length;
    const processing = fileStates.filter(
      (f) => f.phase === "processing",
    ).length;

    return {
      total,
      completed,
      failed,
      uploading,
      processing,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [files, expectedFilesCount]);

  const failedFiles = enhancedFileStates.filter(
    (file) => file.status === "error",
  );

  const allUploadsComplete = progress.completed === expectedFilesCount;
  const hasFailures = failedFiles.length > 0;
  const canRetry = hasFailures;
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
              {allUploadsComplete
                ? "Upload Complete"
                : hasFailures
                  ? "Upload Issues"
                  : "Uploading Photos"}
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

            {hasFailures && (
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
                {enhancedFileStates.length > 0
                  ? enhancedFileStates.map((file) => (
                      <FileProgressItem
                        key={file.key}
                        file={file}
                        topic={
                          topics.find(
                            (topic) => topic.orderIndex === file.orderIndex,
                          )!
                        }
                      />
                    ))
                  : Array.from({ length: expectedFilesCount }, (_, index) => (
                      <motion.div
                        key={`placeholder-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 mr-3">
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
                        </div>
                      </motion.div>
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
                  onClick={retryFailedFiles}
                  variant="outline"
                  className="w-full"
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
