import { create } from "zustand";
import { SelectedPhotoV2 } from "../lib/types";
import { RuleConfig, RuleKey, ValidationResult } from "@vimmer/validation";
import { parseAndValidateFiles } from "@/lib/parse-and-validate-files";

interface AddPhotoDto {
  files: File[];
  ruleConfigs: RuleConfig<RuleKey>[];
  orderIndexes: number[];
  maxPhotos: number;
}
interface PhotoStore {
  photos: SelectedPhotoV2[];
  validationResults: ValidationResult[];
  validateAndAddPhotos: (dto: AddPhotoDto) => Promise<void>;
  removePhoto: (orderIndex: number) => void;
}

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  photos: [],
  validationResults: [],
  validateAndAddPhotos: async (dto: AddPhotoDto) => {
    const { photos } = get();
    const { updatedPhotos, validationResults } = await parseAndValidateFiles(
      photos,
      dto.files,
      dto.ruleConfigs,
      dto.orderIndexes,
      dto.maxPhotos
    );

    set({
      photos: updatedPhotos,
      validationResults,
    });
  },
  removePhoto: (orderIndex) =>
    set(({ photos, validationResults }) => {
      const photoToRemove = photos.find(
        (photo) => photo.orderIndex === orderIndex
      );
      if (!photoToRemove) return { photos, validationResults };

      const updatedPhotos = photos.filter(
        (photo) => photo.orderIndex !== orderIndex
      );

      const reorderedPhotos = updatedPhotos.map((photo) => {
        if (photo.orderIndex > orderIndex) {
          return { ...photo, orderIndex: photo.orderIndex - 1 };
        }
        return photo;
      });

      const updatedValidationResults = validationResults.filter(
        (result) => result.fileName !== photoToRemove.file.name
      );

      return {
        photos: reorderedPhotos,
        validationResults: updatedValidationResults,
      };
    }),
}));
