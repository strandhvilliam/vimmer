import { Submission } from "@vimmer/api/db/types";

export function getThumbnailUrl(
  submission: Submission | null | undefined,
  baseThumbnailUrl: string,
  submissionBaseUrl?: string,
  previewBaseUrl?: string,
): string | null {
  if (!submission?.thumbnailKey) {
    if (!submission?.key) return null;
    if (submission.previewKey && previewBaseUrl) {
      return `${previewBaseUrl}/${submission.previewKey}`;
    }
    if (submissionBaseUrl) {
      return `${submissionBaseUrl}/${submission.key}`;
    }
    return null;
  }
  return `${baseThumbnailUrl}/${submission.thumbnailKey}`;
}
