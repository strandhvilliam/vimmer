import { createClient } from "@vimmer/supabase/browser";
import { Submission, SupabaseRealtimeChannel } from "@vimmer/supabase/types";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

export function useSubmissionsListener() {
  const channel = useRef<SupabaseRealtimeChannel | null>(null);
  const [participantId] = useQueryState("pid", parseAsInteger);
  const [uploadedSubmissionIds, setUploadedSubmissionIds] = useState<number[]>(
    [],
  );

  useEffect(() => {
    if (!participantId) {
      throw new Error("Participant ID is required");
    }

    const supabase = createClient();
    channel.current = supabase
      .channel("submission-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "submissions",
          filter: `participant_id=eq.${participantId}`,
        },
        (payload) => {
          const newSubmission = payload.new as Submission;
          if (newSubmission.status === "uploaded") {
            setUploadedSubmissionIds((prev) => [...prev, newSubmission.id]);
          }
        },
      )
      .subscribe();
    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
    };
  }, [participantId]);

  return uploadedSubmissionIds;
}
