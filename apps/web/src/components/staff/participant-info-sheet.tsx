"use client";

import React, { useState } from "react";
import { CheckCircle, Loader2, RefreshCcw, XCircle } from "lucide-react";

import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  Submission,
  Topic,
  ValidationResult,
} from "@vimmer/api/db/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useSession } from "@/contexts/session-context";
import { PreviewDialog } from "./preview-dialog";
import { DrawerLayout } from "./drawer-layout";
import { ValidationAccordion } from "./validation-accordion";

interface ParticipantInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant:
    | (Participant & {
        validationResults: ValidationResult[];
        competitionClass: CompetitionClass | null;
        deviceGroup: DeviceGroup | null;
        submissions: Submission[];
      })
    | null;
  participantLoading: boolean;
  onParticipantVerified?: () => void;
  topics: Topic[];
  baseThumbnailUrl: string;
  submissionBaseUrl: string;
  previewBaseUrl: string;
}

export function ParticipantInfoSheet({
  open,
  onOpenChange,
  participant,
  participantLoading,
  onParticipantVerified,
  topics,
  baseThumbnailUrl,
  submissionBaseUrl,
  previewBaseUrl,
}: ParticipantInfoSheetProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { user } = useSession();

  const { mutate: verifyParticipant, isPending: isVerifying } = useMutation(
    trpc.validations.createParticipantVerification.mutationOptions({
      onSuccess: () => {
        toast.success("Participant verified successfully");
        onOpenChange(false);
        onParticipantVerified?.();
      },
      onError: (error) => {
        console.error("Error verifying participant:", error);
        toast.error("Failed to verify participant");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.validations.pathKey(),
        });
      },
    }),
  );

  const {
    mutate: updateValidationResult,
    isPending: isUpdatingValidationResult,
  } = useMutation(
    trpc.validations.updateValidationResult.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey:
            trpc.validations.getValidationResultsByParticipantId.queryKey({
              participantId: participant?.id,
            }),
        });
      },
      onError: (error) => {
        console.error("Error overruling validation:", error);
        toast.error("Failed to overrule validation");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.validations.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        });
      },
    }),
  );

  const { mutate: runValidations, isPending: isRunningValidations } =
    useMutation(
      trpc.validations.runValidations.mutationOptions({
        onSuccess: () => {
          toast.success("Validations run successfully");
        },
        onError: (error) => {
          console.error("Error running validations:", error);
          toast.error("Failed to run validations");
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.validations.pathKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.participants.pathKey(),
          });
        },
      }),
    );

  const hasUnresolvedErrors = participant?.validationResults.some(
    (v) => v.severity === "error" && v.outcome === "failed" && !v.overruled,
  );

  const hasOverrulableErrors = participant?.validationResults.some(
    (v) => v.severity === "error" && v.outcome === "failed" && !v.overruled,
  );

  const renderParticipantLoading = () => (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted/40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            Loading Participant Information
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Please wait while we load the participant information
          </p>
        </div>
      </div>
    </div>
  );

  const renderParticipantNotFound = () => (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted/40 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            Participant Not Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            The selected participant could not be loaded. Please try selecting a
            different participant or refresh the page.
          </p>
        </div>
      </div>
    </div>
  );

  const renderParticipant = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-6 pb-3 flex justify-center">
        <div className="flex flex-col flex-0 items-center">
          <span className="text-4xl font-bold font-rocgrotesk">
            #{participant?.reference}
          </span>
          <div className="h-1 w-full bg-vimmer-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex flex-col items-center gap-2 rounded-xl py-2 px-3">
          <div className="text-center">
            <div className="text-lg font-medium text-foreground">
              {participant?.firstname} {participant?.lastname}
            </div>
            {participant?.email && (
              <div className="text-sm text-muted-foreground ">
                {participant?.email}
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full justify-center">
            <div className="flex items-center space-x-2 text-sm bg-green-100 border border-green-400 rounded-full px-3 py-1">
              {participant?.status === "verified" ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <XCircle className="h-4 w-4" />
                  <span className="font-bold">Not Verified</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-8 rounded-full border-muted-foreground/40 !bg-background"
              onClick={() => {
                if (!participant) return;
                runValidations({ participantId: participant.id });
              }}
              disabled={isRunningValidations}
            >
              {isRunningValidations ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Run Validations
            </Button>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          {participant && (
            <ValidationAccordion
              validationResults={participant.validationResults}
              submissions={participant.submissions}
              topics={topics}
              competitionClass={participant.competitionClass}
              baseThumbnailUrl={baseThumbnailUrl}
              submissionBaseUrl={submissionBaseUrl}
              previewBaseUrl={previewBaseUrl}
              onThumbnailClick={(url) => {
                setImageDialogOpen(true);
                setSelectedImageUrl(url);
              }}
              onOverrule={(validationId) =>
                updateValidationResult({
                  id: validationId,
                  data: {
                    overruled: true,
                  },
                })
              }
              isOverruling={isUpdatingValidationResult}
              showOverruleButtons={true}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-background/80 backdrop-blur-sm px-4 py-4 flex justify-center">
        <PrimaryButton
          onClick={() => {
            if (!participant) return;
            if (!user?.id) return;

            if (hasOverrulableErrors) {
              // Overrule all failed error validations first
              const failedErrorValidations =
                participant.validationResults.filter(
                  (v) =>
                    v.severity === "error" &&
                    v.outcome === "failed" &&
                    !v.overruled,
                );

              failedErrorValidations.forEach((validation) => {
                updateValidationResult({
                  id: validation.id,
                  data: {
                    overruled: true,
                  },
                });
              });

              // Then verify the participant
              setTimeout(() => {
                verifyParticipant({
                  data: {
                    participantId: participant.id,
                    staffId: user.id,
                    notes: "",
                  },
                });
              }, 100);
            } else {
              verifyParticipant({
                data: {
                  participantId: participant.id,
                  staffId: user.id,
                  notes: "",
                },
              });
            }
          }}
          disabled={
            participant?.status === "verified" ||
            isVerifying ||
            isUpdatingValidationResult
          }
          className="w-full max-w-sm p-4 text-base"
        >
          {isVerifying || isUpdatingValidationResult ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : participant?.status === "verified" ? (
            "Already Verified"
          ) : hasOverrulableErrors ? (
            "Overrule all and verify"
          ) : (
            "Verify Participant"
          )}
        </PrimaryButton>
      </div>
    </div>
  );

  return (
    <>
      <DrawerLayout
        open={open}
        onOpenChange={onOpenChange}
        title="Participant Information"
      >
        {participantLoading
          ? renderParticipantLoading()
          : participant
            ? renderParticipant()
            : renderParticipantNotFound()}
      </DrawerLayout>
      <PreviewDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        imageUrl={selectedImageUrl}
      />
    </>
  );
}
