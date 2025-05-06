import { Button } from "@vimmer/ui/components/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@vimmer/ui/components/drawer";
import { QrCodeIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { QrDataArgs } from "@/lib/schemas/verification-data-schema";
import { qrScanSchema } from "@/lib/schemas/qr-scan-schema";
import dynamic from "next/dynamic";

const QrScanner = dynamic(() => import("@/components/qr-scanner"), {
  ssr: false,
});

interface QrScanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanAction: (data: QrDataArgs) => void;
}

export default function QrScanDrawer({
  open,
  onOpenChange,
  onScanAction,
}: QrScanDrawerProps) {
  const handleScan = async (data: string | null) => {
    if (!data) return;
    const { success, data: validatedData } = qrScanSchema.safeParse(data);
    if (!success) {
      //TODO: Show toast message
      return;
    }
    onScanAction(validatedData);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent showHandle={false} className="h-full">
        <div className="w-full bg-black/80 h-full justify-center flex relative">
          <QrScanner onScan={handleScan} onError={console.error} />
          <Button
            className="rounded-full absolute top-4 right-4 z-40"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <XIcon size={24} className="" />
          </Button>
          <DrawerTitle className="absolute top-1/4 text-white">
            Scan participant QR-Code
          </DrawerTitle>
          <FinderEdges />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function FinderEdges() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-64 h-64">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
      </div>
    </div>
  );
}
