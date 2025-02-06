import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Progress } from "@vimmer/ui/components/progress";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface UploadProgressProps {
  files: Array<{ id: string; name: string }>;
  onComplete: () => void;
  onError: (error: Error) => void;
}

type FileStatus = "pending" | "uploading" | "completed" | "error";

interface FileState {
  id: string;
  name: string;
  status: FileStatus;
}

export function UploadProgress({
  files,
  onComplete,
  onError,
}: UploadProgressProps) {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  useEffect(() => {
    setFileStates(
      files.map((file) => ({
        id: file.id,
        name: file.name,
        status: "pending",
      })),
    );
  }, [files]);

  useEffect(() => {
    const uploadFiles = async () => {
      try {
        for (const file of fileStates) {
          setFileStates((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "uploading" } : f,
            ),
          );

          await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 2000),
          );

          setFileStates((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "completed" } : f,
            ),
          );
          setCompletedCount((prev) => prev + 1);
        }

        setIsAllCompleted(true);
        onComplete();
      } catch (error) {
        onError(error as Error);
      }
    };

    if (fileStates.length > 0) {
      uploadFiles();
    }
  }, [fileStates.length]);

  const progressPercentage = (completedCount / files.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Uploading Photos</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {completedCount} of {files.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {fileStates.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="truncate flex-1 mr-3">{file.name}</span>
                  <div className="flex-shrink-0">
                    {file.status === "pending" && <div className="w-5 h-5" />}
                    {file.status === "uploading" && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                    {file.status === "completed" && (
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {file.status === "error" && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          {isAllCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button size="lg" onClick={onComplete} className="min-w-[200px]">
                Continue
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
