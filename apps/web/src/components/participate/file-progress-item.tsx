import { FileState } from "@/lib/types";
import { Topic } from "@vimmer/api/db/types";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "@/locales/client";

export function FileProgressItem({
  file,
  topic,
}: {
  file: FileState;
  topic: Topic;
}) {
  const t = useI18n();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </motion.div>
        );
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "pending":
      case "uploading":
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
    }
  };

  const getErrorMessage = () => {
    if (!file.error) return null;

    // Use structured error codes for user-friendly messages
    switch (file.error.code) {
      case "NETWORK_ERROR":
        return t("uploadProgress.error.network");
      case "TIMEOUT":
        return t("uploadProgress.error.timeout");
      case "FILE_TOO_LARGE":
        return t("uploadProgress.error.fileTooLarge");
      case "UNAUTHORIZED":
        return t("uploadProgress.error.unauthorized");
      case "RATE_LIMITED":
        return t("uploadProgress.error.rateLimited");
      case "SERVER_ERROR":
        return t("uploadProgress.error.serverError");
      case "INVALID_FILE_TYPE":
        return t("uploadProgress.error.invalidFileType");
      default:
        return file.error.message || t("uploadProgress.error.generic");
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
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {getStatusIcon(file.status)}
      </div>
    </motion.div>
  );
}
