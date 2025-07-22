"use client";

import React from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  HammerIcon,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@vimmer/ui/components/sheet";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";
import { ValidationStatusBadge } from "@/components/validation-status-badge";
import {
  Participant,
  Submission,
  Topic,
  ValidationResult,
} from "@vimmer/api/db/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useSession } from "@/contexts/session-context";

interface ParticipantInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant:
    | (Participant & {
        validationResults: ValidationResult[];
        submissions: Submission[];
      })
    | null;
  onParticipantVerified?: () => void;
  topics: Topic[];
  baseThumbnailUrl: string;
}

const parseFileNameForOrderIndex = (fileName: string): number | null => {
  const parts = fileName.split("/");
  if (parts.length < 3) return null;

  const fileNamePart = parts[2];
  if (!fileNamePart) return null;

  const parsedNumber = parseInt(fileNamePart, 10) - 1;
  console.log({ parsedNumber });
  if (isNaN(parsedNumber)) return null;
  return parsedNumber;
};

type GroupedValidations = {
  global: ValidationResult[];
  bySubmission: Array<{
    orderIndex: number;
    topic: Topic;
    submission: Submission | null;
    validations: ValidationResult[];
  }>;
};

const groupValidationsBySubmission = (
  validations: ValidationResult[],
  submissions: Submission[],
  topics: Topic[],
): GroupedValidations => {
  const global: ValidationResult[] = [];
  const topicsOrderMap = new Map<number, ValidationResult[]>();

  validations.forEach((validation) => {
    if (!validation.fileName) {
      global.push(validation);
      return;
    }

    const orderIndex = parseFileNameForOrderIndex(validation.fileName);
    if (orderIndex === null) {
      global.push(validation);
      return;
    }

    if (!topicsOrderMap.has(orderIndex)) {
      topicsOrderMap.set(orderIndex, []);
    }
    topicsOrderMap.get(orderIndex)!.push(validation);
  });

  const bySubmission = Array.from(topicsOrderMap.entries())
    .map(([orderIndex, validations]) => {
      const topic = topics.find((t) => t.orderIndex === orderIndex);
      const submission =
        submissions.find((s) => {
          const submissionTopic = topics.find((t) => t.id === s.topicId);
          return submissionTopic?.orderIndex === orderIndex;
        }) || null;

      return topic
        ? {
            orderIndex,
            topic,
            submission,
            validations: validations.sort((a, b) => {
              if (a.outcome === "failed" && b.outcome !== "failed") return -1;
              if (a.outcome !== "failed" && b.outcome === "failed") return 1;
              return 0;
            }),
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    global: global.sort((a, b) => {
      if (a.outcome === "failed" && b.outcome !== "failed") return -1;
      if (a.outcome !== "failed" && b.outcome === "failed") return 1;
      return 0;
    }),
    bySubmission,
  };
};

export function ParticipantInfoSheet({
  open,
  onOpenChange,
  participant,
  onParticipantVerified,
  topics,
  baseThumbnailUrl,
}: ParticipantInfoSheetProps) {
  const [expandedSubmissions, setExpandedSubmissions] = React.useState<
    Set<number>
  >(new Set());
  const [globalExpanded, setGlobalExpanded] = React.useState(false);
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

  const toggleSubmissionExpanded = (orderIndex: number) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderIndex)) {
        newSet.delete(orderIndex);
      } else {
        newSet.add(orderIndex);
      }
      return newSet;
    });
  };

  const toggleGlobalExpanded = () => {
    setGlobalExpanded(!globalExpanded);
  };

  const getThumbnailUrl = (submission: Submission | null): string | null => {
    if (!submission?.thumbnailKey) return null;
    return `${baseThumbnailUrl}/${submission.thumbnailKey}`;
  };

  if (!participant) return null;

  const groupedValidations = groupValidationsBySubmission(
    participant.validationResults,
    participant.submissions,
    topics,
  );

  const hasUnresolvedErrors = participant.validationResults.some(
    (v) => v.severity === "error" && v.outcome === "failed" && !v.overruled,
  );

  const renderValidationItem = (validation: ValidationResult) => (
    <div
      key={validation.id}
      className="pb-3 border-b border-muted last:border-0"
    >
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <ValidationStatusBadge
            outcome={validation.outcome as "failed" | "passed" | "skipped"}
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
                updateValidationResult({
                  id: validation.id,
                  data: {
                    overruled: true,
                  },
                })
              }
              disabled={isUpdatingValidationResult}
            >
              <HammerIcon className="h-4 w-4" />
              Overrule
            </Button>
          )}
      </div>
      <div className="">
        <p className="text-muted-foreground text-xs">{validation.message}</p>
        {validation.fileName && (
          <p className="text-xs text-muted-foreground mt-1">
            File: {validation.fileName}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90dvh] px-0 rounded-xl">
        <SheetTitle className="sr-only">Participant Information</SheetTitle>
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
            <div className="flex items-center mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-8"
                onClick={() =>
                  runValidations({ participantId: participant.id })
                }
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

          <div className="px-4 py-4">
            <h4 className="text-sm font-medium mb-3">Validation Results</h4>
            {participant.validationResults.length > 0 ? (
              <div className="space-y-4">
                {groupedValidations.global.length > 0 && (
                  <div>
                    <button
                      onClick={toggleGlobalExpanded}
                      className="flex items-center gap-2 w-full text-left p-2 hover:bg-muted/30 rounded-lg transition-colors"
                    >
                      {globalExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-medium text-muted-foreground">
                          General Validations
                        </h5>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(() => {
                            const errorCount = groupedValidations.global.filter(
                              (v) =>
                                v.severity === "error" &&
                                v.outcome === "failed",
                            ).length;
                            const warningCount =
                              groupedValidations.global.filter(
                                (v) =>
                                  v.severity === "warning" &&
                                  v.outcome === "failed",
                              ).length;
                            const passedCount =
                              groupedValidations.global.filter(
                                (v) => v.outcome === "passed",
                              ).length;
                            const skippedCount =
                              groupedValidations.global.filter(
                                (v) => v.outcome === "skipped",
                              ).length;

                            return (
                              <>
                                {errorCount > 0 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {errorCount} error
                                    {errorCount !== 1 ? "s" : ""}
                                  </span>
                                )}
                                {warningCount > 0 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {warningCount} warning
                                    {warningCount !== 1 ? "s" : ""}
                                  </span>
                                )}
                                {passedCount > 0 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {passedCount} passed
                                  </span>
                                )}
                                {skippedCount > 0 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {skippedCount} skipped
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </button>
                    {globalExpanded && (
                      <div className="space-y-3 bg-muted/20 p-3 rounded-lg ml-6">
                        {groupedValidations.global.map(renderValidationItem)}
                      </div>
                    )}
                  </div>
                )}

                {groupedValidations.bySubmission.map(
                  ({ orderIndex, topic, submission, validations }) => {
                    const isExpanded = expandedSubmissions.has(orderIndex);
                    const thumbnailUrl = getThumbnailUrl(submission);

                    return (
                      <div
                        key={orderIndex}
                        className="border border-border rounded-lg bg-card shadow-sm"
                      >
                        <button
                          onClick={() => toggleSubmissionExpanded(orderIndex)}
                          className="flex items-center gap-4 w-full text-left p-4 hover:bg-muted/50 transition-colors rounded-lg"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/40 flex-shrink-0 shadow-sm">
                            {thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumbnailUrl}
                                alt={topic.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/60">
                                <span className="text-xs text-muted-foreground font-medium">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {orderIndex + 1}.
                              </span>
                              <h5 className="text-sm font-medium text-foreground truncate">
                                {topic.name}
                              </h5>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {(() => {
                                const errorCount = validations.filter(
                                  (v) =>
                                    v.severity === "error" &&
                                    v.outcome === "failed",
                                ).length;
                                const warningCount = validations.filter(
                                  (v) =>
                                    v.severity === "warning" &&
                                    v.outcome === "failed",
                                ).length;
                                const passedCount = validations.filter(
                                  (v) => v.outcome === "passed",
                                ).length;
                                const skippedCount = validations.filter(
                                  (v) => v.outcome === "skipped",
                                ).length;

                                return (
                                  <>
                                    {errorCount > 0 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {errorCount} error
                                        {errorCount !== 1 ? "s" : ""}
                                      </span>
                                    )}
                                    {warningCount > 0 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        {warningCount} warning
                                        {warningCount !== 1 ? "s" : ""}
                                      </span>
                                    )}
                                    {passedCount > 0 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {passedCount} passed
                                      </span>
                                    )}
                                    {skippedCount > 0 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {skippedCount} skipped
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-border bg-muted/20">
                            <div className="space-y-3 p-4">
                              {validations.map(renderValidationItem)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No validation results available
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background px-4 py-4 flex justify-center pb-10">
          <PrimaryButton
            onClick={() => {
              if (!participant) return;
              if (!user?.id) return;
              verifyParticipant({
                data: {
                  participantId: participant.id,
                  staffId: user.id,
                  notes: "",
                },
              });
            }}
            disabled={
              participant.status === "verified" ||
              hasUnresolvedErrors ||
              isVerifying
            }
            className="w-full p-4 text-base"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : participant.status === "verified" ? (
              "Already Verified"
            ) : hasUnresolvedErrors ? (
              "Overrule all errors to verify"
            ) : (
              "Verify Participant"
            )}
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
