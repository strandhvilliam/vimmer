import { PhotoWithPresignedUrl } from "./types";
import { PresignedSubmission, SelectedPhotoV2 } from "./types";

export function combinePhotos(
  photos: SelectedPhotoV2[],
  presignedSubmissions: PresignedSubmission[]
): PhotoWithPresignedUrl[] {
  console.log({ photos, presignedSubmissions });
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
      orderIndex: matchingPresigned?.orderIndex,
      presignedUrl: matchingPresigned?.presignedUrl,
      key: matchingPresigned?.key,
      submissionId: matchingPresigned?.submissionId,
    });
    return acc;
  }, [] as PhotoWithPresignedUrl[]);
}
