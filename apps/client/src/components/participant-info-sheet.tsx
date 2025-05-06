"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@vimmer/ui/components/sheet";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Participant, ValidationResult } from "@vimmer/supabase/types";
import { useAction } from "next-safe-action/hooks";
import { verifyParticipant } from "@/lib/actions/verify-participant";
import { toast } from "sonner";
import { createClient } from "@vimmer/supabase/browser";

interface ParticipantInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: (Participant & { validationResults: ValidationResult[] }) | null;
  onParticipantVerified?: () => void;
}

export function ParticipantInfoSheet({
  open,
  onOpenChange,
  participant,
  onParticipantVerified,
}: ParticipantInfoSheetProps) {
  const { execute: executeVerifyParticipant } = useAction(verifyParticipant, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Participant verified successfully");
        onOpenChange(false);
        if (onParticipantVerified) {
          onParticipantVerified();
        }
      } else {
        toast.error("Failed to verify participant");
      }
    },
    onError: (error) => {
      console.error("Error verifying participant:", error);
      toast.error("Failed to verify participant");
    },
  });

  const handleVerifyParticipant = () => {
    if (!participant) return;
    executeVerifyParticipant({ participantId: participant.id });
  };

  if (!participant) return null;

  const sortedValidations = [...participant.validationResults].sort((a, b) => {
    if (a.outcome === "failed" && b.outcome !== "failed") return -1;
    if (a.outcome !== "failed" && b.outcome === "failed") return 1;
    return 0;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] px-0" hideClose>
        <SheetHeader className="px-4 border-b pb-4">
          <SheetTitle className="text-xl">Participant Information</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-16">
          <div className="px-4 py-4 border-b">
            <h3 className="text-lg font-medium">
              {participant.firstname} {participant.lastname}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-mono">#{participant.reference}</span>
              {participant.email && <span>• {participant.email}</span>}
            </div>
            <div className="flex items-center mt-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                {participant.status === "verified" ? (
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
                    className="flex items-start gap-2 pb-3 border-b border-muted last:border-0"
                  >
                    {validation.outcome === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p
                        className={
                          validation.outcome === "success"
                            ? "text-green-700 text-sm font-medium"
                            : "text-red-700 text-sm font-medium"
                        }
                      >
                        {validation.ruleKey.replace(/_/g, " ")}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {validation.message}
                      </p>
                      {validation.fileName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          File: {validation.fileName}
                        </p>
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
          {participant.status !== "verified" && (
            <PrimaryButton
              onClick={handleVerifyParticipant}
              className="w-2/3 ml-2"
            >
              Verify Participant
            </PrimaryButton>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
