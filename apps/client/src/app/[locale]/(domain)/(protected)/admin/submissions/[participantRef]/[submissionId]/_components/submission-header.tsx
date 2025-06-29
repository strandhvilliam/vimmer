"use client";

import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@vimmer/ui/components/button";
import { Badge } from "@vimmer/ui/components/badge";
import { cn } from "@vimmer/ui/lib/utils";
import {
  Participant,
  Submission,
  ValidationResult,
  Topic,
} from "@vimmer/supabase/types";

interface SubmissionHeaderProps {
  submission: Submission;
  participant: Participant;
  topic: Topic;
  validationResults: ValidationResult[];
  domain: string;
}

export function SubmissionHeader({
  submission,
  participant,
  topic,
  validationResults,
  domain,
}: SubmissionHeaderProps) {
  const hasValidationResults = validationResults.length > 0;
  const allPassed =
    hasValidationResults &&
    validationResults.every((result) => result.outcome === "passed");
  const hasFailed =
    hasValidationResults &&
    validationResults.some((result) => result.outcome === "failed");

  function getValidationBadgeStyle() {
    if (allPassed)
      return "bg-green-500/15 text-green-600 hover:bg-green-500/20";
    if (hasFailed)
      return "bg-destructive/15 text-destructive hover:bg-destructive/20";
    return "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20";
  }

  function getValidationIcon() {
    if (allPassed) return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
    if (hasFailed) return <XCircle className="h-3.5 w-3.5 mr-1" />;
    return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
  }

  function getValidationText() {
    if (allPassed) return "Valid";
    if (hasFailed) return "Error";
    return "Warning";
  }

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href={`/${domain}/submissions/${participant.reference}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
              #{topic.orderIndex + 1}
            </h1>
            {hasValidationResults && (
              <Badge className={cn("ml-2", getValidationBadgeStyle())}>
                {getValidationIcon()}
                {getValidationText()}
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            Participant #{participant.reference}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Submission
        </Button>
      </div>
    </div>
  );
}
