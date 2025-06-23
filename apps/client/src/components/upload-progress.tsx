import { useSubmissionsListener } from "@/hooks/use-submissions-listener";
import { FileState, FileStatus, PhotoWithPresignedUrl } from "@/lib/types";
import { Topic } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
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
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface Props {
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
}: Props) {
  const uploadedSubmissions = useSubmissionsListener();

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
                        (topic) => topic.orderIndex === file.orderIndex
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

function FileProgressItem({ file, topic }: { file: FileState; topic: Topic }) {
  const statusIcon = {
    pending: <div className="w-5 h-5" />,
    uploading: <Loader2 className="w-5 h-5 animate-spin text-primary" />,
    completed: (
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      </motion.div>
    ),
    error: <XCircle className="w-5 h-5 text-destructive" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between p-3 bg-muted rounded-lg"
    >
      <span className="truncate flex-1 mr-3">{`${(topic.orderIndex + 1).toString().padStart(2, "0")}. ${topic.name}`}</span>
      <div className="flex-shrink-0">{statusIcon[file.status]}</div>
    </motion.div>
  );
}
