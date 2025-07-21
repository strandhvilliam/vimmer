"use client";

import { useSubmissionsListener } from "@/hooks/use-submissions-listener";
import { FileStatus, PhotoWithPresignedUrl } from "@/lib/types";
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
import { Progress } from "@vimmer/ui/components/progress";
import { AnimatePresence, motion } from "motion/react";
import { FileProgressItem } from "@/components/participate/file-progress-item";

interface UploadProgressProps {
  files: PhotoWithPresignedUrl[];
  topics: Topic[];
  expectedCount: number;
  onComplete: () => void;
  open?: boolean;
}

export function UploadProgress({
  files,
  topics,
  expectedCount: expectedFilesCount,
  onComplete,
  open = true,
}: UploadProgressProps) {
  const uploadedSubmissions = useSubmissionsListener({
    enabled: open,
  });

  const fileStates = files.map((file) => ({
    ...file,
    status: (uploadedSubmissions.includes(file.submissionId)
      ? "completed"
      : "uploading") as FileStatus,
  }));

  const progress = {
    percentage: (uploadedSubmissions.length / files.length) * 100,
    completed: uploadedSubmissions.length,
    total: files.length,
  };

  return (
    <Dialog open={open}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
        <DialogTitle className="sr-only">Uploading Photos</DialogTitle>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-xl font-rocgrotesk">
              Uploading Photos
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>
                  {progress.completed} of {progress.total} completed
                </span>
              </div>
              <Progress value={progress.percentage} />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {fileStates.map((file) => (
                  <FileProgressItem
                    key={file.key}
                    file={file}
                    topic={
                      topics.find(
                        (topic) => topic.orderIndex === file.orderIndex,
                      )!
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            {progress.completed === expectedFilesCount && (
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
