import { createClient } from "@vimmer/supabase/browser";
import {
  Participant,
  Submission,
  SupabaseRealtimeChannel,
} from "@vimmer/supabase/types";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useSubmissionQueryState } from "./use-submission-query-state";

export function useVerificationListener() {
  const channel = useRef<SupabaseRealtimeChannel | null>(null);
  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();

  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!participantId) {
      throw new Error("Participant ID is required");
    }

    const supabase = createClient();
    channel.current = supabase
      .channel("verification-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "participants",
          filter: `id=eq.${participantId}`,
        },
        (payload) => {
          const newParticipant = payload.new as Participant;
          if (newParticipant.status === "verified") {
            setIsVerified(true);
          }
        }
      )
      .subscribe();
    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
    };
  }, [participantId]);

  return isVerified;
}
