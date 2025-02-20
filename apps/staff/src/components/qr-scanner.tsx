"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Scanner
      onScan={(result) => result[0] && onScan(result[0].rawValue)}
      components={{
        finder: false,
        audio: false,
      }}
      classNames={{
        container: "flex flex-grow w-full justify-center items-center",
        video: "object-cover w-full",
      }}
      onError={(error) => (error instanceof Error ? onError(error) : {})}
    />
    // <QrReader
    //   onResult={(result, error) => {
    //     if (result) {
    //       onScan(result.gekktText());
    //     }
    //     if (error) {
    //       onError(error);
    //     }
    //   }}
    //   constraints={{ facingMode: "environment" }}
    // />
  );
}
