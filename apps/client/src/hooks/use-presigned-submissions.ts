import { PresignedSubmission } from "@/lib/types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useSubmissionQueryState } from "./use-submission-query-state";
import { useDomain } from "@/contexts/domain-context";
import { useTRPC } from "@/trpc/client";

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
  const trpc = useTRPC();
  const { domain } = useDomain();
  const {
    submissionState: { participantRef, participantId, competitionClassId },
  } = useSubmissionQueryState();

  return useQuery(
    trpc.presignedUrls.generatePresignedSubmissions.queryOptions(
      {
        domain: domain ?? "",
        participantRef: participantRef ?? "",
        participantId: participantId ?? 0,
        competitionClassId: competitionClassId ?? 0,
      },
      {
        enabled: !!(
          domain &&
          participantRef &&
          participantId &&
          competitionClassId
        ),
        retry: (failureCount, error) => {
          onError?.(error as unknown as Error);
          console.error(error);
          return failureCount < 3;
        },
      }
    )
  );
}
