import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { resizeImage } from "@/lib/image-resize";
import exifr from "exifr";

interface UseReplacePhotoOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export function useReplacePhoto(options: UseReplacePhotoOptions = {}) {
  const trpc = useTRPC();
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: getReplacementPresignedUrl } = useMutation(
    trpc.presignedUrls.generateReplacementPresignedUrl.mutationOptions(),
  );

  const { mutate: updateSubmissionAfterUpload } = useMutation(
    trpc.submissions.replacePhoto.mutationOptions({
      onSuccess: () => {
        toast.success("Photo replaced successfully");
        options.onSuccess?.();
      },
      onError: (error) => {
        console.error("Failed to update submission:", error);
        toast.error("Failed to replace photo");
        options.onError?.(new Error(error.message));
      },
      onSettled: () => {
        setIsUploading(false);
        options.onSettled?.();
      },
    }),
  );

  const replacePhoto = async (
    file: File,
    submissionId: number,
    domain: string,
  ) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const presignedData = await getReplacementPresignedUrl({
        submissionId,
        domain,
      });

      const [thumbnailResized, previewResized] = await Promise.all([
        resizeImage(file, { width: presignedData.thumbnail.width }),
        resizeImage(file, { width: presignedData.preview.width }),
      ]);

      const exif = await exifr.parse(file);

      const uploadPromises = [
        fetch(presignedData.original.presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        }),
        fetch(presignedData.thumbnail.presignedUrl, {
          method: "PUT",
          body: thumbnailResized.blob,
          headers: { "Content-Type": file.type },
        }),
        fetch(presignedData.preview.presignedUrl, {
          method: "PUT",
          body: previewResized.blob,
          headers: { "Content-Type": file.type },
        }),
      ];

      const responses = await Promise.all(uploadPromises);

      const failedUploads = responses.filter((response) => !response.ok);
      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} file(s)`);
      }

      updateSubmissionAfterUpload({
        submissionId,
        originalKey: presignedData.original.key,
        thumbnailKey: presignedData.thumbnail.key,
        previewKey: presignedData.preview.key,
        mimeType: file.type,
        size: file.size,
        exif,
      });
    } catch (error) {
      console.error("Failed to replace photo:", error);
      toast.error("Failed to replace photo");
      setIsUploading(false);
      throw error;
    }
  };

  return {
    replacePhoto,
    isUploading,
  };
}
