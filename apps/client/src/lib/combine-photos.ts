import { PhotoWithPresignedUrl } from "./types";
import { PresignedSubmission, SelectedPhotoV2 } from "./types";

export function combinePhotos(
  photos: SelectedPhotoV2[],
  presignedSubmissions: PresignedSubmission[]
) {
  console.log("photos", photos);
  console.log("presignedSubmissions", presignedSubmissions);

  return photos.reduce((acc, photo) => {
    const matchingPresigned = presignedSubmissions?.find(
      (obj) => obj.orderIndex === photo.orderIndex
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
}
