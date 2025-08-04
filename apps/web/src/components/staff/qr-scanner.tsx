import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Scanner
      onScan={(result) => {
        if (result[0]) {
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          onScan(result[0].rawValue);
        } else {
          toast.error("No QR code found");
        }
      }}
      sound={true}
      components={{
        finder: false,
      }}
      classNames={{
        container: "flex flex-grow w-full justify-center items-center",
        video: "object-cover w-full",
      }}
      onError={(error) => (error instanceof Error ? onError(error) : {})}
    />
  );
}
