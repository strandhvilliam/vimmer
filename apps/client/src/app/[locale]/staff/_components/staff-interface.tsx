"use client";

import React, { useEffect, useState } from "react";
import { QrCodeIcon, PenIcon, UsersIcon, LogOutIcon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import QrScanDrawer from "@/components/qr-scan-drawer";
import { ManualEntrySheet } from "@/components/manual-entry-overlay";
import { VerifiedParticipantsSheet } from "./verified-participants-sheet";
import { useAction } from "next-safe-action/hooks";
import { handleVerificationCode } from "@/lib/actions/handle-verification-code";
import { ParticipantInfoSheet } from "./participant-info-sheet";
import {
  DeviceGroup,
  CompetitionClass,
  Participant,
  ParticipantVerification,
  ValidationResult,
  Topic,
} from "@vimmer/supabase/types";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface StaffInterfaceProps {
  staffName: string;
  verifications: (ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  })[];
  topics: Topic[];
}

export function StaffInterface({
  staffName,
  verifications,
  topics,
}: StaffInterfaceProps) {
  const [participantDataIsOpen, setParticipantDataIsOpen] = useState(false);
  const [participantData, setParticipantData] = useState<
    | (Participant & {
        validationResults: ValidationResult[];
        competitionClass: CompetitionClass | null;
        deviceGroup: DeviceGroup | null;
      })
    | null
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
      onError: ({ error }) => {
        if (error.validationErrors?.reference) {
          toast.error(
            error.validationErrors.reference._errors?.at(0) ??
              "Failed to find participant"
          );
        } else {
          toast.error("Could not find participant");
        }
      },
    }
  );

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
      <div className="flex flex-col items-center justify-between h-[100dvh] ">
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
            Staff: {staffName}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-4">
            <PrimaryButton
              onClick={() => setQrScanOpen(true)}
              className="w-48 h-48 rounded-full flex items-center justify-center !shadow-xl"
            >
              <QrCodeIcon className="w-28 h-28" />
            </PrimaryButton>
            <span className="text-lg font-medium text-gray-700 select-none">
              Scan QR Code
            </span>
          </div>
        </div>

        <div className="flex items-center gap-12 mb-6">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setManualEntryOpen(true)}
              className="bg-white w-20 h-20 rounded-full shadow"
            >
              <PenIcon className="w-8 h-8 text-vimmer-primary" />
            </Button>
            <span className="text-gray-700 font-medium">Enter Manually</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setVerifiedListOpen(true)}
              className="bg-white w-20 h-20 rounded-full shadow"
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
      <VerifiedParticipantsSheet
        open={verifiedListOpen}
        onOpenChange={setVerifiedListOpen}
        verifications={verifications}
        topics={topics}
      />
      <ParticipantInfoSheet
        open={participantDataIsOpen}
        onOpenChange={setParticipantDataIsOpen}
        participant={participantData}
        topics={topics}
      />
    </>
  );
}
