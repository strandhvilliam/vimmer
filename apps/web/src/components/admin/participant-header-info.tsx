import {
  Participant,
  CompetitionClass,
  DeviceGroup,
  Submission,
  ValidationResult,
} from "@vimmer/api/db/types";
import { Badge } from "@vimmer/ui/components/badge";
import { Button } from "@vimmer/ui/components/button";
import { cn } from "@vimmer/ui/lib/utils";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface ParticipantHeaderInfoProps {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
    submissions?: Submission[];
  };
  globalValidations: ValidationResult[];
}

export function ParticipantHeaderInfo({
  participant,
  globalValidations,
}: ParticipantHeaderInfoProps) {
  const hasFailedValidations = globalValidations.some(
    (result) => result.outcome === "failed",
  );

  const hasErrors = globalValidations.some(
    (result) => result.severity === "error" && result.outcome === "failed",
  );

  const allPassed = globalValidations.length > 0 && !hasFailedValidations;

  const badgeColor = allPassed
    ? "bg-green-500/15 text-green-600 hover:bg-green-500/20"
    : hasErrors
      ? "bg-destructive/15 text-destructive hover:bg-destructive/20"
      : "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20";

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" asChild className="h-9 w-9">
        <Link href={`/admin/submissions`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
            {`#${participant.reference} - `}
            {`${participant.firstname} ${participant.lastname}`}
          </h1>
          {globalValidations.length > 0 && (
            <Badge className={cn("ml-2", badgeColor)}>
              {allPassed ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
              ) : hasErrors ? (
                <XCircle className="h-3.5 w-3.5 mr-1" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              )}
              {allPassed ? "Valid" : hasErrors ? "Error" : "Warning"}
            </Badge>
          )}
        </div>
        <Link
          href={`mailto:${participant.email}`}
          className="text-sm text-muted-foreground flex items-center gap-1 hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>{participant.email}</span>
        </Link>
      </div>
    </div>
  );
}
