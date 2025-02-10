import { Topic } from "@vimmer/supabase/types";
import { SubmissionValidator, createRule } from "@vimmer/utils/validator";
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
      return remainingPhotos.map((photo, index) => ({
        ...photo,
        topicId: topics[index]!.id,
        topicName: topics[index]!.name,
      }));
    });
  };

  const validateAndAddPhotos = async (
    acceptedFiles: File[],
    currentLength: number,
    maxPhotos: number,
  ) => {
    const remainingSlots = maxPhotos - currentLength;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    const newPhotos = filesToProcess.map((file, index) => {
      const topicIndex = currentLength + index;
      const topic = topics[topicIndex];

      return {
        file,
        preview: URL.createObjectURL(file),
        topicId: topic!.id,
        topicName: topic!.name,
      };
    });

    const toValidate = [...photos, ...newPhotos];
    const validator = new SubmissionValidator([
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
      toValidate.map((photo) => photo.file),
    );
    const finalPhotos = toValidate.map((photo) => {
      const result = validation.find((r) =>
        r.invalidFiles.includes(photo.file.name),
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
