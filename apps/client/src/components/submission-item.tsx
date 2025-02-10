import { SelectedPhoto } from "@/lib/types";
import { ImageIcon, X } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  photo?: SelectedPhoto;
  topic?: { id: number; name: string };
  index: number;
  onRemove?: () => void;
}

export function SubmissionItem({ photo, topic, index, onRemove }: Props) {
  if (!photo) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-muted/10">
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Image {index + 1}</p>
            <p className="font-medium">Topic: {topic?.name}</p>
          </div>
        </div>
        <div className="w-[100px] h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 shrink-0">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
      <div className="flex-1 space-y-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Image {index + 1}</p>
          <p className="font-medium">Topic: {photo.topicName}</p>
        </div>
        {!photo.isValid && (
          <p className="text-sm text-destructive">{photo.validationMessage}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Size: {formatFileSize(photo.file.size)}
        </p>
      </div>
      <div className="relative w-[100px] h-[100px] shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full rounded-lg overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.preview}
            alt={`Upload preview ${index + 1}`}
            className="object-cover w-full h-full"
          />
        </motion.div>
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/75 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
