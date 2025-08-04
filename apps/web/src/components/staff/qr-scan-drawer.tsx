import { Button } from "@vimmer/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@vimmer/ui/components/drawer";
import { XIcon } from "lucide-react";
import { QrDataArgs } from "@/lib/schemas/verification-data-schema";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import posthog from "posthog-js";

const QrScanner = dynamic(
  () => import("./qr-scanner").then((mod) => mod.QrScanner),
  {
    ssr: false,
  },
);

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
    if (!data) {
      toast.error("Invalid QR code");
      return;
    }
    onOpenChange(false);

    const [domain, _, participantReference] = data.split("-");
    if (!domain || !participantReference) {
      toast.error("Invalid QR code");
      posthog.captureException(new Error("Invalid QR code"), {
        properties: {
          data,
        },
      });
      return;
    }
    onScanAction({ domain, reference: participantReference });
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
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
      </div>
    </div>
  );
}
