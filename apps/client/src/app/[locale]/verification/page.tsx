import React from "react";
import { type SearchParams } from "nuqs/server";
import { loadSubmissionQueryServerParams } from "@/lib/schemas/submission-query-server-schema";
import { QrDisplay } from "@/components/verification/qr-display";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const domain = "dev0";
  const { participantId, participantRef } =
    await loadSubmissionQueryServerParams(searchParams);
  const qrCodeValue = `${domain}-${participantId}-${participantRef}`;

  return <QrDisplay qrCodeValue={qrCodeValue} />;
}
