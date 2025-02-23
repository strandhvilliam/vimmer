"use client";
import { parseAsInteger, useQueryState } from "nuqs";
import { QRCodeSVG } from "qrcode.react";
import React from "react";

const StagingPage: React.FC = () => {
  const [pid] = useQueryState("pid", parseAsInteger);

  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="text-2xl h-full flex items-center justify-center font-bold">
        Almost there!
      </h1>
      <div className="flex flex-col h-full justify-center items-center">
        <div className="shadow-xl p-8 rounded-xl">
          {pid && <QrCodeGenerator value={pid} size={256} />}
        </div>
        <p className="mt-8">Show to a crew member</p>
      </div>
      <div className="h-full flex flex-col justify-end">
        <h3 className="py-4">vimmer</h3>
      </div>
    </div>
  );
};

export default StagingPage;

interface QrCodeGeneratorProps {
  value?: number;
  size?: number; // Optional: Size of the QR code (default: 256)
  level?: "L" | "M" | "Q" | "H"; // Optional: Error correction level (default: 'L')
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  value,
  size = 256,
  level = "L",
}) => {
  if (!value) {
    return null;
  }

  return <QRCodeSVG value={value.toString()} size={size} level={level} />;
};
