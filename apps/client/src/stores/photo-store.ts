import { create } from "zustand";
import { SelectedPhotoV2 } from "../lib/types";
import {
  RuleConfig,
  RuleKey,
  runValidations,
  ValidationResult,
} from "@vimmer/validation";
import { CompetitionClass, Topic } from "@vimmer/supabase/types";
import exifr from "exifr";

interface PhotoStore {
  photos: SelectedPhotoV2[];
  validationResults: ValidationResult[];
  addPhotos: (photos: SelectedPhotoV2[]) => void;
  addValidationResults: (results: ValidationResult[]) => void;
  removePhoto: (orderIndex: number) => void;
}

interface AddPhotoDto {
  files: File[];
  ruleConfigs: RuleConfig<RuleKey>[];
  topics: Topic[];
  competitionClass: CompetitionClass;
}

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  photos: [],
  validationResults: [],
  validateAndAddPhotos: async ({
    files,
    ruleConfigs,
    topics,
    competitionClass,
  }: AddPhotoDto) => {
    const { photos } = get();

    const currentLength = photos.length;
    const maxPhotos = competitionClass?.numberOfPhotos;

    if (!currentLength || !maxPhotos) return;

    const remainingSlots = maxPhotos - currentLength;
    const sortedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);

    const newPhotos = await Promise.all(
      files.slice(0, remainingSlots).map(async (file, index) => {
        const topic = sortedTopics[currentLength + index];
        if (!topic) return null;

        const exif = await exifr.parse(file);
        return {
          file,
          exif: exif as { [key: string]: unknown },
          preview: URL.createObjectURL(file),
          orderIndex: topic.orderIndex,
        };
      })
    );

    const validPhotos = newPhotos.filter((photo) => photo !== null);

    const validationInputs = [...photos, ...validPhotos].map((photo) => ({
      exif: photo.exif,
      fileName: photo.file.name,
      fileSize: photo.file.size,
      orderIndex: photo.orderIndex,
      mimeType: photo.file.type,
    }));

    const updatedValidationResults = runValidations(
      ruleConfigs,
      validationInputs
    );

    set({
      photos: validPhotos,
      validationResults: updatedValidationResults,
    });
  },
  addPhotos: (photos) =>
    set((state) => ({ photos: [...state.photos, ...photos] })),
  removePhoto: (orderIndex) =>
    set((state) => {
      const photoToRemove = state.photos.find(
        (photo) => photo.orderIndex === orderIndex
      );
      if (!photoToRemove) return { photos: state.photos };

      const updatedPhotos = state.photos.filter(
        (photo) => photo.orderIndex !== orderIndex
      );

      const reorderedPhotos = updatedPhotos.map((photo) => {
        if (photo.orderIndex > orderIndex) {
          return { ...photo, orderIndex: photo.orderIndex - 1 };
        }
        return photo;
      });

      const updatedValidationResults = state.validationResults.filter(
        (result) => result.fileName !== photoToRemove.file.name
      );

      return {
        photos: reorderedPhotos,
        validationResults: updatedValidationResults,
      };
    }),
  addValidationResults: (results) =>
    set((state) => ({
      validationResults: [...state.validationResults, ...results],
    })),
}));
