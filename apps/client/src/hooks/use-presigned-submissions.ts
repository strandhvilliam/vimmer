import { PresignedSubmission } from "@/lib/types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useSubmissionQueryState } from "./use-submission-query-state";
import { useDomain } from "@/contexts/domain-context";

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
  const { domain } = useDomain();
  const {
    submissionState: { participantRef, participantId, competitionClassId },
  } = useSubmissionQueryState();

  const queryKey = [
    "presigned-submissions",
    domain,
    participantRef,
    participantId,
    competitionClassId,
  ];

  const enabled = !!(
    domain &&
    participantRef &&
    participantId &&
    competitionClassId
  );

  return useQuery<PresignedSubmission[]>({
    queryKey,
    queryFn: () => {
      if (!enabled) {
        return [];
      }
      const url = `/api/presigned-submission?domain=${domain}&participantRef=${participantRef}&participantId=${participantId}&competitionClassId=${competitionClassId}`;
      return fetcher(url);
    },
    refetchOnWindowFocus: false,
    staleTime: 5000,
    retry: (failureCount, error) => {
      onError?.(error as Error);
      console.error(error);
      return failureCount < 3;
    },
  });
}
