import { RuleConfig, RuleKey, runValidations } from "@vimmer/validation";
import { SelectedPhotoV2 } from "./types";
import exifr from "exifr";

export async function parseAndValidateFiles(
  currentPhotos: SelectedPhotoV2[],
  files: File[],
  ruleConfigs: RuleConfig<RuleKey>[],
  orderIndexes: number[],
  maxPhotos: number
) {
  const currentLength = currentPhotos.length;
  const remainingSlots = maxPhotos - currentLength;
  const sortedOrderIndexes = orderIndexes.sort((a, b) => a - b);

  const newPhotos = await Promise.all(
    files.slice(0, remainingSlots).map(async (file, index) => {
      const orderIndex = sortedOrderIndexes[currentLength + index];
      if (!orderIndex && orderIndex !== 0) return null;

      const exif = await exifr.parse(file);
      return {
        file,
        exif: exif as { [key: string]: unknown },
        preview: URL.createObjectURL(file),
        orderIndex,
      };
    })
  );

  const validPhotos = newPhotos.filter(
    (photo): photo is SelectedPhotoV2 => photo !== null
  );

  const sortedByTime = [...currentPhotos, ...validPhotos]
    .sort((a, b) => {
      const aDate = getExifDate(a.exif);
      const bDate = getExifDate(b.exif);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    })
    .map((photo, index) => ({
      ...photo,
      orderIndex: sortedOrderIndexes[index] ?? -1,
    }))
    .filter((photo) => photo.orderIndex !== -1);

  const validationInputs = sortedByTime.map((photo) => ({
    exif: photo.exif,
    fileName: photo.file.name,
    fileSize: photo.file.size,
    orderIndex: photo.orderIndex,
    mimeType: photo.file.type,
  }));

  const validationResults = runValidations(ruleConfigs, validationInputs);

  return {
    updatedPhotos: sortedByTime,
    validationResults,
  };
}

function getExifDate(exif: { [key: string]: unknown }) {
  if (!exif) return null;
  if (exif.DateTimeOriginal) return exif.DateTimeOriginal as string;
  if (exif.CreateDate) return exif.CreateDate as string;
  return null;
}
