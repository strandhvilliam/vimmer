import { FileState } from "@/lib/types";
import { Topic } from "@vimmer/api/db/types";
import { CheckCircle2, Loader2, XCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@vimmer/ui/components/button";

export function FileProgressItem({
  file,
  topic,
  onRetry,
}: {
  file: FileState;
  topic: Topic;
  onRetry?: () => void;
}) {
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

  const getErrorMessage = () => {
    if (!file.error) return null;

    // Use structured error codes for user-friendly messages
    switch (file.error.code) {
      case "NETWORK_ERROR":
        return "Network error - check your connection";
      case "TIMEOUT":
        return "Upload timed out - try again";
      case "FILE_TOO_LARGE":
        return "File too large";
      case "UNAUTHORIZED":
        return "Upload not authorized - refresh and try again";
      case "RATE_LIMITED":
        return "Rate limited - please wait before retrying";
      case "SERVER_ERROR":
        return "Server error - try again later";
      case "INVALID_FILE_TYPE":
        return "Invalid file type - only images allowed";
      default:
        return file.error.message || "Upload failed";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-center justify-between p-3 rounded-lg ${
        file.status === "error"
          ? "bg-destructive/5 border border-destructive/20"
          : "bg-muted"
      }`}
    >
      <div className="flex-1 mr-3">
        <span className="truncate block">
          {`${(topic.orderIndex + 1).toString().padStart(2, "0")}. ${topic.name}`}
        </span>
        {file.status === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-destructive mt-1"
          >
            {getErrorMessage()}
            {file.retryCount && file.retryCount > 0 && (
              <span className="ml-2 text-muted-foreground">
                (Attempt {file.retryCount + 1})
              </span>
            )}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {file.status === "error" && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 w-6 p-0 hover:bg-primary/10"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
        {statusIcon[file.status]}
      </div>
    </motion.div>
  );
}
