import { useEffect, useState } from "react";
import { useSubmissionQueryState } from "./use-submission-query-state";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useSubmissionsListener({ enabled }: { enabled: boolean }) {
  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();
  const [uploadedSubmissionIds, setUploadedSubmissionIds] = useState<number[]>(
    [],
  );

  const trpc = useTRPC();
  const { data: submissions } = useQuery(
    trpc.submissions.getByParticipantId.queryOptions(
      {
        participantId: participantId ?? -1,
      },
      {
        refetchInterval: 2000,
        enabled: !!participantId && enabled,
      },
    ),
  );

  useEffect(() => {
    if (submissions) {
      setUploadedSubmissionIds(
        submissions.filter((s) => s.status === "uploaded").map((s) => s.id),
      );
    }
  }, [submissions]);

  return uploadedSubmissionIds;
}
