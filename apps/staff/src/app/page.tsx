"use client";

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const QrScanner = dynamic(() => import("../components/qr-scanner"), {
  ssr: false,
});

export default function HomePage() {
  redirect("/verification");
}
