import { useEffect } from "react";
import { useSubmissionQueryState } from "./use-submission-query-state";
import useSWR from "swr";

interface Props {
  onVerified: () => void;
}

async function fetchParticipant(participantId: number): Promise<boolean> {
  const response = await fetch(`/api/is-participant-verified/${participantId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch participant: ${response.statusText}`);
  }

  const { isVerified } = await response.json();
  console.log("isVerified", isVerified);
  return isVerified;
}

export function useVerificationListener(props?: Props) {
  // Commented out realtime implementation
  // const channel = useRef<SupabaseRealtimeChannel | null>(null);
  // const supabase = createClient();

  const {
    submissionState: { participantId },
  } = useSubmissionQueryState();

  // SWR implementation with polling
  const { data: isVerified } = useSWR(
    participantId ? `participant-${participantId}` : null,
    () => fetchParticipant(participantId!),
    {
      refreshInterval: 2000,
    }
  );

  useEffect(() => {
    if (isVerified) {
      props?.onVerified?.();
    }
  }, [isVerified, props]);

  // Commented out original realtime implementation
  // useEffect(() => {
  //   if (!participantId) {
  //     throw new Error("Participant ID is required");
  //   }

  //   channel.current = supabase
  //     .channel("verification-listener")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "UPDATE",
  //         schema: "public",
  //         table: "participants",
  //         filter: `id=eq.${participantId}`,
  //       },
  //       (payload) => {
  //         const newParticipant = payload.new as Participant;
  //         if (newParticipant.status === "verified") {
  //           setIsVerified(true);
  //           props?.onVerified?.();
  //         }
  //       }
  //     )
  //     .subscribe();
  //   return () => {
  //     channel.current?.unsubscribe();
  //     channel.current = null;
  //   };
  // }, [participantId]);

  return isVerified;
}
