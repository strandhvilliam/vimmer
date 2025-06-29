import React from "react";
import { getParticipantsByDomain } from "@vimmer/supabase/cached-queries";
import { Participant, ValidationResult } from "@vimmer/supabase/types";
import { AlertsTable } from "./_components/alerts-table";

interface ParticipantWithValidation extends Participant {
  validationResults: ValidationResult[];
}

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const participants = await getParticipantsByDomain(domain);

  const participantsWithIssues = participants.filter((participant) => {
    const validationResults = participant.validationResults || [];
    return validationResults.some(
      (result) =>
        result.outcome === "failed" &&
        (result.severity === "warning" || result.severity === "error")
    );
  }) as ParticipantWithValidation[];

  const allValidationIssues = participantsWithIssues.flatMap((participant) => {
    return (participant.validationResults || [])
      .filter(
        (result) =>
          result.outcome === "failed" &&
          (result.severity === "warning" || result.severity === "error")
      )
      .map((result) => ({
        ...result,
        participantName: `${participant.firstname} ${participant.lastname}`,
        participantReference: participant.reference,
      }));
  });

  return (
    <div className="space-y-4 container py-6">
      <div className="flex justify-between  flex-col">
        <h1 className="text-2xl font-semibold font-rocgrotesk">
          Validation Alerts
        </h1>
        <p className="text-sm text-muted-foreground">
          Showing all validation issues for the marathon.
        </p>
      </div>
      <AlertsTable alerts={allValidationIssues} />
    </div>
  );
}
