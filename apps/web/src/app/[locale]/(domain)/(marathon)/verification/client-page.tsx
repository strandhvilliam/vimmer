"use client";

import { motion } from "framer-motion";
import QrCodeGenerator from "@/components/participate/qr-generator";
import {
  CardDescription,
  CardTitle,
  CardHeader,
} from "@vimmer/ui/components/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { submissionQueryClientParamSerializer } from "@/lib/schemas/submission-query-client-schema";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { RefreshCcw } from "lucide-react";
import { cn } from "@vimmer/ui/lib/utils";
import { useRefreshTimeout } from "@/hooks/use-refresh-timeout";

export function ClientVerificationPage() {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const { submissionState } = useSubmissionQueryState();
  const router = useRouter();

  const { data: participant, refetch } = useQuery(
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
        refetchInterval: 5000,
      },
    ),
  );

  useEffect(() => {
    if (participant?.status === "verified") {
      const params = submissionQueryClientParamSerializer(submissionState);
      router.push(`/confirmation${params}`);
    }
  }, [participant, router, submissionState]);

  const { refreshTimeout, startTimeout, isActive } = useRefreshTimeout();

  const qrCodeValue = `${domain}-${participant?.id}-${participant?.reference}`;

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] p-4 space-y-8">
      <div>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            Almost there!
          </CardTitle>
          <CardDescription className="text-center">
            Show this QR code to a crew member to verify your submission.
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
                      Participant
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
          ? `Refresh available in ${refreshTimeout}s`
          : "Refresh"}
      </PrimaryButton>
    </div>
  );
}
