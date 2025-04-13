import { Topic } from "@vimmer/supabase/types";
import exifr from "exifr";
import { useState } from "react";
import { SelectedPhoto } from "../types";
import {
  createRule,
  RULE_KEYS,
  RuleConfig,
  RuleKey,
  runValidations,
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
  ValidationInput,
  ValidationResult,
} from "@vimmer/validation";

export const usePhotoManagement = ({ topics }: { topics: Topic[] }) => {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [groupValidations, setGroupValidations] = useState<ValidationResult[]>(
    []
  );

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

    if (photos.length > 1) {
      validateExistingPhotos(photos.filter((p) => p.topicId !== topicId));
    } else {
      setGroupValidations([]);
    }
  };

  const validateExistingPhotos = (photosToValidate: SelectedPhoto[]) => {
    if (!photosToValidate.length) return;

    const ruleConfigs: RuleConfig<RuleKey>[] = [
      createRule(RULE_KEYS.ALLOWED_FILE_TYPES, SEVERITY_LEVELS.ERROR, {
        allowedFileTypes: ["jpg", "jpeg"],
      }),
      createRule(RULE_KEYS.SAME_DEVICE, SEVERITY_LEVELS.ERROR),
      createRule(RULE_KEYS.MODIFIED, SEVERITY_LEVELS.WARNING),
      createRule(RULE_KEYS.WITHIN_TIMERANGE, SEVERITY_LEVELS.ERROR, {
        start: new Date("2023-01-01"),
        end: new Date("2026-01-01"),
      }),
      createRule(RULE_KEYS.SAME_DEVICE, SEVERITY_LEVELS.ERROR),
    ];

    const validationInputs: ValidationInput[] = photosToValidate.map(
      (photo) => ({
        exif: photo.exif,
        fileName: photo.file.name,
        fileSize: photo.file.size,
        orderIndex: photo.orderIndex,
        mimeType: photo.file.type,
      })
    );

    const validationResults = runValidations(ruleConfigs, validationInputs);

    const individualValidations = validationResults.filter(
      (result) => !!result.fileName
    );
    const collectionValidations = validationResults.filter(
      (result) => !result.fileName
    );

    setGroupValidations(collectionValidations);

    const finalPhotos = photosToValidate.map((photo) => {
      const results = individualValidations.filter(
        (r) => r.fileName === photo.file.name
      );

      if (results.length === 0) return photo;

      results.sort((a, b) => {
        if (a.outcome !== b.outcome) {
          if (a.outcome === VALIDATION_OUTCOME.FAILED) return -1;
          if (b.outcome === VALIDATION_OUTCOME.FAILED) return 1;
          if (a.outcome === VALIDATION_OUTCOME.SKIPPED) return -1;
          if (b.outcome === VALIDATION_OUTCOME.SKIPPED) return 1;
        }

        if (a.severity !== b.severity) {
          if (a.severity === "error") return -1;
          if (b.severity === "error") return 1;
        }

        return 0;
      });

      const highestPriorityResult = results[0]!;

      return {
        ...photo,
        validationMessage: highestPriorityResult.message,
        validationOutcome: highestPriorityResult.outcome,
        validationSeverity: highestPriorityResult.severity,
        validationRuleKey: highestPriorityResult.ruleKey,
      };
    });

    setPhotos(finalPhotos);
  };

  const validateAndAddPhotos = async (
    acceptedFiles: File[],
    currentLength: number,
    maxPhotos: number
  ) => {
    const remainingSlots = maxPhotos - currentLength;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    const newPhotos = await Promise.all(
      filesToProcess.map(async (file, index) => {
        const topicIndex = currentLength + index;
        const sortedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);

        const exif = await exifr.parse(file);

        return {
          file,
          exif: exif as { [key: string]: unknown },
          preview: URL.createObjectURL(file),
          topicId: sortedTopics[topicIndex]!.id,
          topicName: sortedTopics[topicIndex]!.name,
          orderIndex: topicIndex,
        };
      })
    );

    const toValidate = [...photos, ...newPhotos];
    validateExistingPhotos(toValidate);
  };

  return {
    photos,
    groupValidations,
    removePhoto,
    validateAndAddPhotos,
  };
};
