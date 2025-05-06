"use client";

import React, { useState } from "react";
import { QrCodeIcon, PenIcon, UsersIcon, LogOutIcon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import QrScanDrawer from "@/components/qr-scan-drawer";
import { ManualEntrySheet } from "@/components/manual-entry-overlay";
import { VerifiedParticipantsSheet } from "@/components/verified-participants-sheet";
import { useAction } from "next-safe-action/hooks";
import { handleVerificationCode } from "@/lib/handle-verification-code";
import { ParticipantInfoSheet } from "@/components/participant-info-sheet";
import { Participant, ValidationResult } from "@vimmer/supabase/types";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const [participantDataIsOpen, setParticipantDataIsOpen] = useState(false);
  const [participantData, setParticipantData] = useState<
    (Participant & { validationResults: ValidationResult[] }) | null
  >(null);
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [verifiedListOpen, setVerifiedListOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const router = useRouter();

  const { execute: executeVerificationCode } = useAction(
    handleVerificationCode,
    {
      onSuccess: async ({ data }) => {
        if (!data) {
          toast.error("Failed to verify participant");
          return;
        }
        setParticipantData(data);
        setParticipantDataIsOpen(true);
      },
    }
  );

  const handleParticipantVerified = () => {
    // setRefreshVerifiedList((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await authClient.signOut();
      router.push("/staff/login");
    } catch (error) {
      toast.error("Failed to logout");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between h-[100dvh] pb-20">
        <DotPattern />
        <div className="w-full flex justify-center pt-20 pb-6 flex-col items-center gap-2 relative">
          <Button
            variant="secondary"
            size="sm"
            className="text-muted-foreground absolute top-4 left-4 shadow rounded-full"
            onClick={handleLogout}
            disabled={isLogoutLoading}
          >
            {isLogoutLoading ? "Logging out..." : "Logout"}
            {!isLogoutLoading && <LogOutIcon className="ml-1 h-4 w-4" />}
          </Button>
          <h1 className="text-4xl font-bold font-rocgrotesk">Verification</h1>
          <p className="text-muted-foreground text-lg font-rocgrotesk">
            Staff: Villiam Strandh
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-10 mt-12">
          <QrCodeIcon className="w-24 h-24 text-vimmer-primary" />

          <Button
            onClick={() => setQrScanOpen(true)}
            className="w-64 h-14 text-base rounded-full font-medium shadow "
          >
            Scan QR Code
          </Button>
        </div>

        <div className="flex items-center gap-12 mb-6">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setManualEntryOpen(true)}
              className="bg-white w-20 h-20 rounded-full  shadow"
            >
              <PenIcon className="w-8 h-8 text-vimmer-primary" />
            </Button>
            <span className="text-gray-700 font-medium">Enter Manually</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setVerifiedListOpen(true)}
              className="bg-white w-20 h-20 rounded-full  shadow"
            >
              <UsersIcon className="w-8 h-8 text-vimmer-primary" />
            </Button>
            <span className="text-gray-700 font-medium">Verified</span>
          </div>
        </div>
      </div>
      <QrScanDrawer
        open={qrScanOpen}
        onOpenChange={setQrScanOpen}
        onScanAction={executeVerificationCode}
      />
      <ManualEntrySheet
        open={manualEntryOpen}
        onOpenChange={setManualEntryOpen}
        onEnterAction={executeVerificationCode}
      />
      {/* <VerifiedParticipantsSheet
        open={verifiedListOpen}
        onOpenChange={setVerifiedListOpen}
        refreshTrigger={refreshVerifiedList}
      /> */}
      <ParticipantInfoSheet
        open={participantDataIsOpen}
        onOpenChange={setParticipantDataIsOpen}
        participant={participantData}
        onParticipantVerified={handleParticipantVerified}
      />
    </>
  );
}
