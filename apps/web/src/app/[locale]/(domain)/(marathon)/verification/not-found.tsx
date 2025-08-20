"use client";

import { motion } from "framer-motion";
import {
  CardDescription,
  CardTitle,
  CardHeader,
} from "@vimmer/ui/components/card";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { XCircle, ArrowLeft } from "lucide-react";
import { useDomain } from "@/contexts/domain-context";

export default function RejectedSubmissionPage() {
  const { domain } = useDomain();

  const handleNavigateToParticipate = () => {
    window.location.replace(`https://${domain}.blikka.app/participate`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] p-4 space-y-8">
      <div>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            Submission Rejected
          </CardTitle>
          <CardDescription className="text-center">
            A crew member has rejected your submission. Please try again with a
            new submission.
          </CardDescription>
        </CardHeader>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <motion.div
          className="flex flex-col justify-center items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.2,
            delay: 0.1,
          }}
        >
          <div className="relative">
            <motion.div
              className="shadow-lg p-12 md:p-20 rounded-xl bg-white w-full max-w-xs md:max-w-lg lg:max-w-2xl  flex flex-col items-center justify-center space-y-6"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-24 w-24 text-red-500" strokeWidth={1.5} />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-rocgrotesk font-semibold text-gray-900">
                    Your submission was not approved
                  </h3>
                  <p className="text-gray-600 max-w-sm">
                    Don't worry! You can start the process again and submit new
                    photos for review.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <PrimaryButton
        className="mt-4 py-3 w-full max-w-xs md:max-w-md"
        onClick={handleNavigateToParticipate}
      >
        <ArrowLeft className="h-4 w-4" />
        Try Again
      </PrimaryButton>
    </div>
  );
}
