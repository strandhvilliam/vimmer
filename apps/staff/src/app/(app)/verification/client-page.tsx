"use client";
import { ManualEntrySheet } from "@/components/manual-entry-overlay";
import QrScanDrawer from "@/components/qr-scan-drawer";
import { handleVerificationCode } from "@/lib/actions/handle-verification-code";
import { ParticipantData } from "@/lib/types";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import {
  Drawer,
  DrawerTitle,
  DrawerContent,
  DrawerFooter,
} from "@vimmer/ui/components/drawer";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { XIcon } from "lucide-react";
import { acceptParticipant } from "@/lib/actions/accept-participant";

export default function VerificationClientPage() {
  const [participantDataIsOpen, setParticipantDataIsOpen] = useState(false);
  const [participantData, setParticipantData] =
    useState<ParticipantData | null>(null);

  const { execute: executeVerificationCode } = useAction(
    handleVerificationCode,
    {
      onSuccess: async ({ data }) => {
        if (!data) return;
        setParticipantData(data);
        setParticipantDataIsOpen(true);
      },
    },
  );

  const { execute: markAsVerified } = useAction(acceptParticipant, {
    onSuccess: async () => {
      setParticipantDataIsOpen(false);
    },
  });

  return (
    <main className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6">
        <div className="w-24 h-24 border-2 rounded-lg border-black flex items-center justify-center"></div>
        <QrScanDrawer onScanAction={executeVerificationCode} />
        <ManualEntrySheet onEnterAction={executeVerificationCode} />
        <button onClick={() => setParticipantDataIsOpen(true)}>
          Show data
        </button>
      </div>
      <div className="mt-auto mb-8 text-lg font-bold text-center">vimmer</div>

      <Drawer
        activeSnapPoint={participantDataIsOpen ? "90%" : "0%"}
        open={participantDataIsOpen}
        onOpenChange={setParticipantDataIsOpen}
      >
        <DrawerContent className="p-4 h-[90%]">
          <DrawerTitle className="text-white">Participant Data</DrawerTitle>
          <div className="mb-6 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{participantData?.reference}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{participantData?.status}</span>
            </div>
          </div>
          <ScrollArea className="overflow-auto">
            {participantData?.submissions.map((submission, idx) => (
              <div key={submission.id} className="flex items-center gap-4 mb-1">
                <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                  <span className="text-foreground font-bold text-xl">
                    {idx}
                  </span>
                </div>
                <div>
                  <p className="">{submission.key}</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.createdAt}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>

          <DrawerFooter className="flex justify-end">
            <div className="mt-6 pt-4 border-t">
              <button
                className="w-full bg-primary text-white py-3 rounded-lg 
            hover:bg-primary/90 transition-colors"
                onClick={() =>
                  participantData?.id &&
                  markAsVerified({ pid: participantData?.id })
                }
              >
                Verify
              </button>
            </div>
          </DrawerFooter>

          <button
            onClick={() => setParticipantDataIsOpen(false)}
            className="absolute bg-muted p-1 rounded-full top-2 right-2 
    flex items-center justify-center"
          >
            <XIcon className="stroke-foreground" />
          </button>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
