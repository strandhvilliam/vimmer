import { useState } from "react";
import { PresignedObject } from "../actions/initialize-submission";
import { PhotoWithPresignedUrl, SelectedPhoto } from "../types";
import { toast } from "@vimmer/ui/hooks/use-toast";

export const useUploadManagement = ({
  photos,
  presignedObjects,
}: {
  photos: SelectedPhoto[];
  presignedObjects: PresignedObject[];
}) => {
  const [isUploading, setIsUploading] = useState(false);
  console.log({ photos, presignedObjects });

  const combinedPhotos = photos.reduce((acc, photo) => {
    const matchingPresigned = presignedObjects.find(
      (obj) => obj.topicId === photo.topicId
    );

    if (!matchingPresigned || !matchingPresigned.submissionId) {
      console.error("Missing presigned object for photo", photo);
      return acc;
    }
    acc.push({
      ...photo,
      presignedUrl: matchingPresigned?.presignedUrl,
      key: matchingPresigned?.key,
      submissionId: matchingPresigned?.submissionId,
    });
    return acc;
  }, [] as PhotoWithPresignedUrl[]);

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      await Promise.all(
        combinedPhotos.map(async (photo) => {
          if (!photo.presignedUrl) return;
          console.log("uploading photo", photo);

          const response = await fetch(photo.presignedUrl, {
            method: "PUT",
            body: photo.file,
            headers: {
              "Content-Type": photo.file.type,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to upload file");
          }
        })
      );
    } catch (error) {
      setIsUploading(false);
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return {
    isUploading,
    setIsUploading,
    handleUpload,
    combinedPhotos,
  };
};
