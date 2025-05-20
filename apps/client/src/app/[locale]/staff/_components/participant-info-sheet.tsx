"use client";

import React from "react";
import { CheckCircle, HammerIcon, XCircle, XIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@vimmer/ui/components/sheet";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Participant, Topic, ValidationResult } from "@vimmer/supabase/types";
import { useAction } from "next-safe-action/hooks";
import { verifyParticipant } from "@/lib/actions/verify-participant";
import { toast } from "sonner";
import { ValidationStatusBadge } from "@/components/validation-status-badge";
import { overruleValidation } from "../_actions/overrule-validation";

interface ParticipantInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: (Participant & { validationResults: ValidationResult[] }) | null;
  onParticipantVerified?: () => void;
  topics: Topic[];
}

const getTopicIndexFromFileName = (fileName: string) => {
  const parts = fileName.split("/");
  if (parts.length < 3) return null;
  const topicOrderStr = parts[2];
  if (!topicOrderStr) return null;
  return parseInt(topicOrderStr, 10);
};

const getTopicNameFromFileName = (fileName: string, topics: Topic[]) => {
  const topicIndex = getTopicIndexFromFileName(fileName);
  if (!topicIndex) return null;
  return topics.find((t) => t.orderIndex === topicIndex - 1)?.name;
};

export function ParticipantInfoSheet({
  open,
  onOpenChange,
  participant,
  onParticipantVerified,
  topics,
}: ParticipantInfoSheetProps) {
  const [localParticipant, setLocalParticipant] = React.useState(participant);

  React.useEffect(() => {
    setLocalParticipant(participant);
  }, [participant]);

  const { execute: executeVerifyParticipant } = useAction(verifyParticipant, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Participant verified successfully");
        onOpenChange(false);
        onParticipantVerified?.();
      } else {
        toast.error("Failed to verify participant");
      }
    },
    onError: (error) => {
      console.error("Error verifying participant:", error);
      toast.error("Failed to verify participant");
    },
  });

  const {
    execute: executeOverruleValidation,
    isExecuting: isOverruleValidationExecuting,
  } = useAction(overruleValidation, {
    onSuccess: ({ data }) => {
      if (data) {
        setLocalParticipant((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            validationResults: prev.validationResults.map((v) =>
              v.id === data.id ? { ...v, overruled: true } : v
            ),
          };
        });
      }
    },
    onError: (error) => {
      console.error("Error overruling validation:", error);
      toast.error("Failed to overrule validation");
    },
  });

  const handleVerifyParticipant = () => {
    if (!localParticipant) return;
    executeVerifyParticipant({ participantId: localParticipant.id });
  };

  if (!localParticipant) return null;

  const sortedValidations = [...localParticipant.validationResults].sort(
    (a, b) => {
      if (a.outcome === "failed" && b.outcome !== "failed") return -1;
      if (a.outcome !== "failed" && b.outcome === "failed") return 1;
      return 0;
    }
  );

  // Check if there are any failed, non-overruled validations
  const hasUnresolvedErrors = localParticipant.validationResults.some(
    (v) => v.severity === "error" && v.outcome === "failed" && !v.overruled
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90dvh] px-0 rounded-xl">
        <SheetTitle className="sr-only">Participant Information</SheetTitle>
        <div className="overflow-y-auto h-full pb-16">
          <div className="px-4 py-4 border-b">
            <h3 className="text-lg font-medium">
              {localParticipant.firstname} {localParticipant.lastname}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-mono">#{localParticipant.reference}</span>
              {localParticipant.email && (
                <span>• {localParticipant.email}</span>
              )}
            </div>
            <div className="flex items-center mt-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                {localParticipant.status === "verified" ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <XCircle className="h-4 w-4" />
                    <span>Not Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-4">
            <h4 className="text-sm font-medium mb-3">Validation Results</h4>
            {sortedValidations.length > 0 ? (
              <div className="space-y-3">
                {sortedValidations.map((validation) => (
                  <div
                    key={validation.id}
                    className="pb-3 border-b border-muted last:border-0"
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <ValidationStatusBadge
                          outcome={
                            validation.outcome as
                              | "failed"
                              | "passed"
                              | "skipped"
                          }
                          severity={validation.severity as "error" | "warning"}
                        />
                        <span
                          className={
                            validation.outcome === "passed"
                              ? "text-green-700 text-sm font-medium"
                              : validation.severity === "error"
                                ? "text-red-700 text-sm font-medium"
                                : "text-amber-700 text-sm font-medium"
                          }
                        >
                          {validation.ruleKey.replace(/_/g, " ")}
                        </span>
                      </div>
                      {validation.severity === "error" &&
                        validation.outcome === "failed" &&
                        !validation.overruled && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              executeOverruleValidation({
                                validationResultId: validation.id,
                                participantReference:
                                  localParticipant.reference,
                              })
                            }
                            disabled={isOverruleValidationExecuting}
                          >
                            <HammerIcon className="h-4 w-4" />
                            Overrule
                          </Button>
                        )}
                    </div>
                    <div className="">
                      <p className="text-muted-foreground text-sm">
                        {validation.message}
                      </p>
                      {validation.fileName && (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">
                            File: {validation.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Topic:{" "}
                            {getTopicIndexFromFileName(validation.fileName)}.{" "}
                            {getTopicNameFromFileName(
                              validation.fileName,
                              topics
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No validation results available
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background px-4 py-4 flex justify-between pb-10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-1/3"
          >
            Close
          </Button>
          <PrimaryButton
            onClick={handleVerifyParticipant}
            className="w-2/3 ml-2"
            disabled={
              localParticipant.status === "verified" || hasUnresolvedErrors
            }
          >
            {localParticipant.status === "verified"
              ? "Already Verified"
              : hasUnresolvedErrors
                ? "Overrule all errors to verify"
                : "Verify Participant"}
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
