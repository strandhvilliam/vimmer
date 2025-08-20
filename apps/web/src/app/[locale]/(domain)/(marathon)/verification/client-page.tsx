"use client";

import { motion } from "framer-motion";
import QrCodeGenerator from "@/components/participate/qr-generator";
import {
  CardDescription,
  CardTitle,
  CardHeader,
} from "@vimmer/ui/components/card";
import { useCallback, useEffect } from "react";
import { notFound } from "next/navigation";
import { submissionQueryClientParamSerializer } from "@/lib/schemas/submission-query-client-schema";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { RefreshCcw } from "lucide-react";
import { cn } from "@vimmer/ui/lib/utils";
import { useRefreshTimeout } from "@/hooks/use-refresh-timeout";
import { useI18n } from "@/locales/client";
import { useParticipantStatusRealtime } from "@/contexts/use-participant-status-realtime";

export function ClientVerificationPage({
  realtimeConfig,
}: {
  realtimeConfig: {
    endpoint: string;
    authorizer: string;
    topic: string;
  };
}) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const { submissionState } = useSubmissionQueryState();
  const t = useI18n();

  const handleNavigateOnVerified = useCallback(() => {
    const params = submissionQueryClientParamSerializer(submissionState);
    window.location.replace(
      `https://${domain}.blikka.app/confirmation${params}`,
    );
  }, [submissionState, domain]);

  const {
    data: participant,
    refetch,
    isLoading,
  } = useQuery(
    trpc.participants.getByReference.queryOptions(
      {
        domain,
        reference: submissionState.participantRef ?? "",
      },
      {
        enabled: !!submissionState.participantRef,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 15000,
      },
    ),
  );

  useParticipantStatusRealtime({
    participantId: submissionState.participantId ?? undefined,
    realtimeConfig,
    onEvent: (payload) => {
      if (payload.status === "verified") {
        handleNavigateOnVerified();
      }
      if (payload.status === "rejected") {
        notFound();
      }
    },
  });

  // useRealtime({
  //   channelName: `participants-${submissionState.participantId}`,
  //   filter: `id=eq.${submissionState.participantId}`,
  //   event: "*",
  //   table: "participants",
  //   onEvent: (payload) => {
  //     if (
  //       payload.eventType === "UPDATE" &&
  //       payload.new.status === "verified" &&
  //       payload.new.id === submissionState.participantId
  //     ) {
  //       handleNavigateOnVerified()
  //     }
  //   },
  // })

  useEffect(() => {
    if (participant?.status === "verified") {
      handleNavigateOnVerified();
    }

    if (!isLoading && !participant) {
      notFound();
    }
  }, [participant, handleNavigateOnVerified, isLoading]);

  const { refreshTimeout, startTimeout, isActive } = useRefreshTimeout();

  const qrCodeValue = `${domain}-${participant?.id}-${participant?.reference}`;

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] p-4 space-y-8">
      <div>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            {t("verification.almostThere")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("verification.showQrCode")}
          </CardDescription>
        </CardHeader>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <motion.div
          className="flex flex-col justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.2,
            delay: 0.2,
          }}
        >
          <div className="relative qr-perspective">
            <motion.div
              className="shadow-lg p-12 md:p-20 rounded-xl bg-white cursor-pointer relative qr-backface-hidden w-full max-w-xs md:max-w-lg lg:max-w-2xl min-h-[420px] md:min-h-[520px] flex flex-col items-center justify-center"
              animate={{
                rotateY: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <>
                <QrCodeGenerator value={qrCodeValue} size={212} />
                {participant?.reference && (
                  <div className="flex flex-col items-center mt-8">
                    <span className="text-xl md:text-2xl font-rocgrotesk font-semibold text-gray-700">
                      {t("participant")}
                    </span>
                    <span
                      className="font-mono font-bold text-4xl md:text-5xl text-gray-900 select-all tracking-wider mt-2"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      {participant.reference}
                    </span>
                  </div>
                )}
              </>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <PrimaryButton
        className="mt-4 py-3 w-full max-w-xs md:max-w-lg lg:max-w-2xl"
        onClick={async () => {
          await refetch();
          startTimeout(5);
        }}
        disabled={isActive}
      >
        <RefreshCcw className={cn("h-4 w-4")} />
        {refreshTimeout > 0
          ? t("verification.refreshAvailable", { seconds: refreshTimeout })
          : t("refresh")}
      </PrimaryButton>
    </div>
  );
}
