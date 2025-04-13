"use client";

import { motion } from "framer-motion";
import QrCodeGenerator from "@/components/qr-generator";
import {
  CardDescription,
  CardTitle,
  CardHeader,
} from "@vimmer/ui/components/card";
import { useState, useEffect } from "react";
import { useVerificationListener } from "@/lib/hooks/use-verification-listener";
import { useRouter } from "next/navigation";
import { submissionQueryClientParamSerializer } from "@/schemas/submission-query-client-schema";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { Resource } from "sst";

interface ClientVerificationPageProps {
  qrCodeValue: string;
}

export function ClientVerificationPage({
  qrCodeValue,
}: ClientVerificationPageProps) {
  const { submissionState } = useSubmissionQueryState();
  useVerificationListener({
    onVerified: () => {
      const params = submissionQueryClientParamSerializer(submissionState);
      router.push(`/confirmation${params}`);
    },
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .qr-perspective {
        perspective: 1000px;
      }
      .qr-backface-hidden {
        backface-visibility: hidden;
      }
    `;
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
              className="shadow-xl p-8 rounded-xl bg-white cursor-pointer relative qr-backface-hidden"
              animate={{
                rotateY: isFlipped ? 180 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {qrCodeValue && (
                <QrCodeGenerator value={qrCodeValue} size={256} />
              )}
            </motion.div>

            <motion.div
              className="shadow-xl p-8 rounded-xl bg-white cursor-pointer absolute inset-0 flex items-center justify-center qr-backface-hidden"
              initial={{ rotateY: -180 }}
              animate={{
                rotateY: isFlipped ? 0 : -180,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Verification Code</p>
                <p className="font-mono text-xl select-all">{qrCodeValue}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          className="text-sm text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          QR code not working?{" "}
          <button
            onClick={() => setIsFlipped(true)}
            className="text-primary hover:underline"
          >
            Click to reveal code
          </button>
        </motion.p>
      </div>
    </div>
  );
}
