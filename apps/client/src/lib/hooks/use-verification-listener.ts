import { createClient } from "@vimmer/supabase/browser";
import { Participant, SupabaseRealtimeChannel } from "@vimmer/supabase/types";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useSubmissionQueryState } from "./use-submission-query-state";

const supabase = createClient();

interface Props {
  onVerified: () => void;
}

export function useVerificationListener(props?: Props) {
  const channel = useRef<SupabaseRealtimeChannel | null>(null);
  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();

  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!participantId) {
      throw new Error("Participant ID is required");
    }

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
            props?.onVerified?.();
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
