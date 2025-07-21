import { FileState } from "@/lib/types";
import { Topic } from "@vimmer/api/db/types";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";

export function FileProgressItem({
  file,
  topic,
}: {
  file: FileState;
  topic: Topic;
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
