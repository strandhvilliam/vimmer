"use client";
import { ManualEntrySheet } from "@/components/manual-entry-overlay";
import { Button } from "@vimmer/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@vimmer/ui/components/drawer";
import { QrCodeIcon, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const QrScanner = dynamic(() => import("@/components/qr-scanner"), {
  ssr: false,
});

export default function VerificationPage() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");

  const handleScan = async (data: string | null) => {
    if (data) {
      setScanning(false);
      // const participantInfo = await fetchParticipantData(data);
      // setParticipantData(participantInfo);
    }
  };

  const handleManualEntry = async () => {
    if (manualEntry) {
      // const participantInfo = await fetchParticipantData(manualEntry);
      // setParticipantData(participantInfo);
      setManualEntry("");
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6">
        <div className="w-24 h-24 border-2 rounded-lg border-black flex items-center justify-center"></div>

        <Drawer open={scanning} onOpenChange={(open) => setScanning(open)}>
          <DrawerTrigger asChild>
            <Button
              className="w-full bg-[#E76F51] hover:bg-[#E76F51]/90 text-white rounded-lg py-6"
              onClick={() => setScanning(true)}
            >
              <QrCodeIcon className="w-6 h-6" />
              <span className="flex items-center gap-2">Scan QR-Code</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full">
            <div className="w-full bg-black/80 h-full justify-center flex relative">
              <QrScanner onScan={handleScan} onError={console.error} />
              <Button
                className="rounded-full absolute top-4 right-4 z-40"
                size="icon"
                onClick={() => setScanning(false)}
              >
                <XIcon size={24} className="" />
              </Button>
              <DrawerTitle className="absolute top-1/4 text-white">
                Scan participant QR-Code
              </DrawerTitle>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <button
          onClick={() => {
            setIsOverlayOpen(true);
            // Handle manual entry navigation or modal
          }}
          className="text-black underline"
        >
          Enter Manually
        </button>
      </div>
      <div className="mt-auto mb-8 text-lg font-bold text-center">
        product name
      </div>
      <ManualEntrySheet
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onSubmit={(value) => {
          setManualEntry(value);
          handleManualEntry();
        }}
      />
    </>
  );
}
