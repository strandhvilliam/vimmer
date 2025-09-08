import { create } from "zustand"
import { SelectedPhotoV2 } from "@/lib/types"
import {
  RuleConfig,
  RuleKey,
  ValidationResult,
} from "../../../../../packages/validation/old/types"
import { parseAndValidateFiles } from "@/lib/parse-and-validate-files"

interface AddPhotoDto {
  files: File[]
  ruleConfigs: RuleConfig<RuleKey>[]
  orderIndexes: number[]
  maxPhotos: number
  preconvertedExifData: { name: string; exif: any }[]
}

interface RemovePhotoDto {
  photoToRemoveIndex: number
  ruleConfigs: RuleConfig<RuleKey>[]
  orderIndexes: number[]
  maxPhotos: number
}

interface PhotoStore {
  photos: SelectedPhotoV2[]
  validationResults: ValidationResult[]
  validateAndAddPhotos: (dto: AddPhotoDto) => Promise<void>
  updateThumbnail: (fileName: string, thumbnail: string) => void
  removePhoto: (dto: RemovePhotoDto) => Promise<void>
}

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  photos: [],
  validationResults: [],
  validateAndAddPhotos: async (dto: AddPhotoDto) => {
    const { photos } = get()

    const { updatedPhotos, validationResults } = await parseAndValidateFiles(
      photos,
      dto.files,
      dto.ruleConfigs,
      dto.orderIndexes,
      dto.maxPhotos,
      dto.preconvertedExifData,
      (fileName, thumbnail) =>
        set(({ photos }) => ({
          photos: photos.map((photo) =>
            photo.file.name === fileName
              ? { ...photo, thumbnail, thumbnailLoading: false }
              : photo
          ),
        }))
    )

    set({
      photos: updatedPhotos,
      validationResults,
    })
  },
  updateThumbnail: (fileName: string, thumbnail: string) =>
    set(({ photos }) => ({
      photos: photos.map((photo) =>
        photo.file.name === fileName
          ? { ...photo, thumbnail, thumbnailLoading: false }
          : photo
      ),
    })),
  removePhoto: async (dto: RemovePhotoDto) => {
    const { photos } = get()
    const photoToRemove = photos.find(
      (photo) => photo.orderIndex === dto.photoToRemoveIndex
    )
    if (photoToRemove) {
      if (photoToRemove.thumbnail) URL.revokeObjectURL(photoToRemove.thumbnail)
      if (photoToRemove.preview) URL.revokeObjectURL(photoToRemove.preview)

      const newPhotos = photos.filter(
        (photo) => photo.orderIndex !== dto.photoToRemoveIndex
      )

      const reorderedPhotos = newPhotos.map((photo) => {
        if (photo.orderIndex > dto.photoToRemoveIndex) {
          return { ...photo, orderIndex: photo.orderIndex - 1 }
        }
        return photo
      })

      const { updatedPhotos, validationResults } = await parseAndValidateFiles(
        reorderedPhotos,
        [],
        dto.ruleConfigs,
        dto.orderIndexes,
        dto.maxPhotos,
        [],
        (fileName, thumbnail) =>
          set(({ photos }) => ({
            photos: photos.map((photo) =>
              photo.file.name === fileName
                ? { ...photo, thumbnail, thumbnailLoading: false }
                : photo
            ),
          }))
      )

      set({
        photos: updatedPhotos,
        validationResults,
      })
    }
  },
}))
