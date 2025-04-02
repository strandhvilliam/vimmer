import React from "react";
import { type SearchParams } from "nuqs/server";
import { loadSubmissionQueryServerParams } from "@/lib/schemas/submission-query-server-schema";
import { ClientVerificationPage } from "./client-page";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const domain = "dev0";
  const { participantId, participantRef } =
    await loadSubmissionQueryServerParams(searchParams);
  const qrCodeValue = `${domain}-${participantId}-${participantRef}`;

  return <ClientVerificationPage qrCodeValue={qrCodeValue} />;
}
