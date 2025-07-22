"use client";

import React, { useState } from "react";
import { QrCodeIcon, PenIcon, UsersIcon, LogOutIcon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import QrScanDrawer from "@/components/qr-scan-drawer";
import { ManualEntrySheet } from "@/components/staff/manual-entry-overlay";
import { VerifiedParticipantsSheet } from "@/components/staff/verified-participants-sheet";
import { ParticipantInfoSheet } from "@/components/staff/participant-info-sheet";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";

export function StaffClientPage({
  baseThumbnailUrl,
}: {
  baseThumbnailUrl: string;
}) {
  const trpc = useTRPC();
  const { user } = useSession();
  const { domain } = useDomain();
  const [activeParticipantReference, setActiveParticipantReference] = useState<
    string | null
  >(null);

  const { data: participantData } = useQuery(
    trpc.participants.getByReference.queryOptions(
      {
        reference: activeParticipantReference ?? "",
        domain,
      },
      {
        enabled: !!activeParticipantReference,
      },
    ),
  );

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const [openSheet, setOpenSheet] = useState<
    "participant-info" | "qr-scan" | "manual-entry" | "verified-list" | null
  >(null);

  const router = useRouter();

  const { data: verifications } = useSuspenseQuery(
    trpc.validations.getParticipantVerificationsByStaffId.queryOptions(
      {
        staffId: user?.id ?? "",
      },
      {
        enabled: !!user?.id,
      },
    ),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await authClient.signOut();
      router.push("/auth/staff/login");
    } catch (error) {
      console.error(error);
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
            Staff: {user?.name}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-4">
            <PrimaryButton
              onClick={() => setOpenSheet("qr-scan")}
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
              onClick={() => setOpenSheet("manual-entry")}
              className="bg-white w-20 h-20 rounded-full shadow"
            >
              <PenIcon className="w-8 h-8 text-vimmer-primary" />
            </Button>
            <span className="text-gray-700 font-medium">Enter Manually</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpenSheet("verified-list")}
              className="bg-white w-20 h-20 rounded-full shadow"
            >
              <UsersIcon className="w-8 h-8 text-vimmer-primary" />
            </Button>
            <span className="text-gray-700 font-medium">Verified</span>
          </div>
        </div>
      </div>
      <QrScanDrawer
        open={openSheet === "qr-scan"}
        onOpenChange={() => setOpenSheet(null)}
        onScanAction={(qrCode) => {
          toast.info("Data: " + JSON.stringify(qrCode));
          setActiveParticipantReference(qrCode.reference);
          setOpenSheet("participant-info");
        }}
      />
      <ManualEntrySheet
        open={openSheet === "manual-entry"}
        onOpenChange={() => setOpenSheet(null)}
        onEnterAction={(args) => {
          setActiveParticipantReference(args.reference);
          setOpenSheet("participant-info");
        }}
      />
      <VerifiedParticipantsSheet
        open={openSheet === "verified-list"}
        onOpenChange={() => setOpenSheet(null)}
        verifications={verifications}
        topics={topics}
        baseThumbnailUrl={baseThumbnailUrl}
      />
      <ParticipantInfoSheet
        open={openSheet === "participant-info"}
        onOpenChange={() => setOpenSheet(null)}
        participant={participantData ?? null}
        topics={topics}
        baseThumbnailUrl={baseThumbnailUrl}
      />
    </>
  );
}
