import { PhotoWithPresignedUrl } from "@/lib/types";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeUpload = async (combinedPhotos: PhotoWithPresignedUrl[]) => {
    setIsUploading(true);
    try {
      await Promise.all(
        combinedPhotos.map(async (photo) =>
          fetch(photo.presignedUrl, {
            method: "PUT",
            body: photo.file,
            headers: {
              "Content-Type": photo.file.type,
            },
          })
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
      posthog.captureException(error);
      if (error instanceof Error) {
        setError(error);
      }
      setIsUploading(false);
    }
  };

  return { isUploading, error, executeUpload };
}
