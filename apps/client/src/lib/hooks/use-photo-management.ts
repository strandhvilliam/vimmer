import { Topic } from "@vimmer/supabase/types";
import { ClientValidator, createRule } from "@vimmer/validation/client";
import { useState } from "react";
import { SelectedPhoto } from "../types";

export const usePhotoManagement = ({ topics }: { topics: Topic[] }) => {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);

  const removePhoto = (topicId: number) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.topicId === topicId);
      if (photoToRemove?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      const remainingPhotos = prev.filter((photo) => photo.topicId !== topicId);
      const sortedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);
      return remainingPhotos.map((photo, index) => ({
        ...photo,
        topicId: sortedTopics[index]!.id,
        topicName: sortedTopics[index]!.name,
      }));
    });
  };

  const validateAndAddPhotos = async (
    acceptedFiles: File[],
    currentLength: number,
    maxPhotos: number
  ) => {
    const remainingSlots = maxPhotos - currentLength;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    const newPhotos = filesToProcess.map((file, index) => {
      const topicIndex = currentLength + index;
      const sortedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);

      return {
        file,
        preview: URL.createObjectURL(file),
        topicId: sortedTopics[topicIndex]!.id,
        topicName: sortedTopics[topicIndex]!.name,
      };
    });

    const toValidate = [...photos, ...newPhotos];
    const validator = new ClientValidator([
      createRule({
        key: "allowed_file_types",
        level: "error",
        params: { extensions: ["jpg"], mimeTypes: ["image/jpeg"] },
      }),
      createRule({
        key: "same_device",
        level: "error",
        params: {},
      }),
    ]);
    const validation = await validator.validate(
      toValidate.map((photo) => photo.file)
    );
    const finalPhotos = toValidate.map((photo) => {
      const result = validation.find((r) =>
        r.invalidFiles.includes(photo.file.name)
      );
      return result
        ? {
            ...photo,
            isValid: false,
            validationMessage: result.message,
          }
        : {
            ...photo,
            isValid: true,
            validationMessage: undefined,
          };
    });

    setPhotos(finalPhotos);
  };
  return {
    photos,
    removePhoto,
    validateAndAddPhotos,
  };
};
