"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Download,
  Mail,
  MoreHorizontal,
  Shield,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Badge } from "@vimmer/ui/components/badge";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  ValidationResult,
} from "@vimmer/supabase/types";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vimmer/ui/components/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { cn } from "@vimmer/ui/lib/utils";
import { useAction } from "next-safe-action/hooks";
import { verifyParticipant } from "../_actions/verify-participant";
import { toast } from "sonner";

interface ParticipantHeaderProps {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
  validationResults?: ValidationResult[];
}

export function ParticipantHeader({
  participant,
  validationResults = [],
}: ParticipantHeaderProps) {
  const { domain } = useParams();

  // Get validation results that are not tied to a specific submission (no fileName)
  const globalValidations = validationResults.filter(
    (result) => !result.fileName
  );

  // Check validation status
  const hasFailedValidations = globalValidations.some(
    (result) => result.outcome === "failed"
  );

  // Determine highest severity level (error takes precedence over warning)
  const hasErrors = globalValidations.some(
    (result) => result.severity === "error" && result.outcome === "failed"
  );

  const hasWarnings = globalValidations.some(
    (result) => result.severity === "warning" && result.outcome === "failed"
  );

  // All validations passed
  const allPassed = globalValidations.length > 0 && !hasFailedValidations;

  // Check if participant is already verified
  const isVerified = participant.status === "verified";

  // Verify participant action
  const { execute: executeVerifyParticipant, isExecuting: isVerifying } =
    useAction(verifyParticipant, {
      onSuccess: () => {
        toast.success("Participant verified successfully");
      },
      onError: () => {
        toast.error("Failed to verify participant");
      },
    });

  const handleVerifyParticipant = () => {
    executeVerifyParticipant({
      participantId: participant.id,
      domain: domain as string,
      reference: participant.reference,
    });
  };

  return (
    <div className="">
      {/* Header with back button, name, and action buttons */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href={`/${domain}/submissions`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
                {`${participant.firstname} ${participant.lastname}`}
              </h1>
              {globalValidations.length > 0 && (
                <Badge
                  className={cn(
                    "ml-2",
                    allPassed
                      ? "bg-green-500/15 text-green-600 hover:bg-green-500/20"
                      : hasErrors
                        ? "bg-destructive/15 text-destructive hover:bg-destructive/20"
                        : "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20"
                  )}
                >
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
            <span className="text-sm text-muted-foreground">
              Participant #{participant.reference}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {!isVerified && (
            <PrimaryButton
              onClick={handleVerifyParticipant}
              disabled={isVerifying}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isVerifying ? "Verifying..." : "Verify"}
            </PrimaryButton>
          )}
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {/* Dropdown for additional actions */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Manage submissions</DropdownMenuItem>
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Participant details card */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Competition Class
              </span>
              <span className="text-sm">
                {participant?.competitionClass?.name || "No class"}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Device Group
              </span>
              <span className="text-sm">
                {participant?.deviceGroup?.name || "No device group"}
              </span>
            </div>

            {participant.email && (
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Email
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{participant.email}</span>
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Status
              </span>
              <div className="flex items-center gap-2">
                {isVerified && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span
                  className={cn(
                    "text-sm capitalize",
                    isVerified ? "text-green-600 font-medium" : ""
                  )}
                >
                  {participant.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
