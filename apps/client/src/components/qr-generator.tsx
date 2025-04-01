"use client";
import { QRCodeSVG } from "qrcode.react";
interface QrCodeGeneratorProps {
  value?: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
}

function QrCodeGenerator({
  value,
  size = 256,
  level = "L",
}: QrCodeGeneratorProps) {
  if (!value) {
    return null;
  }

  return (
    <QRCodeSVG
      imageSettings={{
        src: "/vimmer-black.svg",
        x: undefined,
        y: undefined,
        height: 30,
        width: 47,
        excavate: true,
      }}
      value={value}
      size={size}
    />
  );
}

export default QrCodeGenerator;
