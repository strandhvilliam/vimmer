import { PresignedSubmission } from "@/lib/types";
import useSWR from "swr";
import { useSubmissionQueryState } from "./use-submission-query-state";
import { useDomain } from "./use-domain";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch submissions");
    }
    return res.json();
  });

export function usePresignedSubmissions({
  onError,
}: {
  onError?: (err: Error) => void;
} = {}) {
  const domain = useDomain();
  const {
    submissionState: { participantRef, participantId, competitionClassId },
  } = useSubmissionQueryState();

  let url = null;
  if (domain && participantRef && participantId && competitionClassId) {
    url = `/api/presigned-submission?domain=${domain}&participantRef=${participantRef}&participantId=${participantId}&competitionClassId=${competitionClassId}`;
  }

  return useSWR<PresignedSubmission[]>(url, fetcher, {
    fallbackData: [],
    onError: (err) => {
      onError?.(err);
      console.error(err);
    },
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 5000,
    suspense: true,
  });
}
