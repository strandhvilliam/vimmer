"use client";
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

const generateUrl = (
  domain: string,
  participantRef: string | null,
  participantId: number | null,
  competitionClassId: number | null
) => {
  if (!participantRef || !participantId || !competitionClassId) {
    return null;
  }
  return `/api/presigned-submission?domain=${domain}&participantRef=${participantRef}&participantId=${participantId}&competitionClassId=${competitionClassId}`;
};

export function usePresignedSubmissions({
  onError,
}: {
  onError?: (err: Error) => void;
} = {}) {
  const domain = useDomain();
  const {
    submissionState: { participantRef, participantId, competitionClassId },
  } = useSubmissionQueryState();

  const url = generateUrl(
    domain,
    participantRef,
    participantId,
    competitionClassId
  );
  return useSWR<PresignedSubmission[]>(url, fetcher, {
    onError,
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 5000,
    suspense: true,
  });
}
