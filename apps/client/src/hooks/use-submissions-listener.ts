import { createClient } from "@vimmer/supabase/browser";
import { Submission, SupabaseRealtimeChannel } from "@vimmer/supabase/types";
import { useEffect, useRef, useState } from "react";
import { useSubmissionQueryState } from "./use-submission-query-state";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useSubmissionsListener() {
  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();
  const [uploadedSubmissionIds, setUploadedSubmissionIds] = useState<number[]>(
    []
  );

  const trpc = useTRPC();
  const { data: submissions } = useQuery(
    trpc.submissions.getByParticipantId.queryOptions(
      {
        participantId: participantId ?? -1,
      },
      {
        refetchInterval: 2000,
        enabled: !!participantId,
      }
    )
  );

  useEffect(() => {
    if (submissions) {
      setUploadedSubmissionIds(
        submissions.filter((s) => s.status === "uploaded").map((s) => s.id)
      );
    }
  }, [submissions]);

  // useEffect(() => {
  //   if (!participantId) {
  //     throw new Error("Participant ID is required");
  //   }

  //   const supabase = createClient();
  //   channel.current = supabase
  //     .channel("submission-listener")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "UPDATE",
  //         schema: "public",
  //         table: "submissions",
  //         filter: `participant_id=eq.${participantId}`,
  //       },
  //       (payload) => {
  //         const newSubmission = payload.new as Submission;
  //         if (newSubmission.status === "uploaded") {
  //           setUploadedSubmissionIds((prev) => [...prev, newSubmission.id]);
  //         }
  //       }
  //     )
  //     .subscribe();
  //   return () => {
  //     channel.current?.unsubscribe();
  //     channel.current = null;
  //   };
  // }, [participantId]);

  return uploadedSubmissionIds;
}
