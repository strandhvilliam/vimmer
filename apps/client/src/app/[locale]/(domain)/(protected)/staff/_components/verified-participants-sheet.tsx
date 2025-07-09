import { Button } from "@vimmer/ui/components/button";
import { Sheet, SheetContent, SheetTitle } from "@vimmer/ui/components/sheet";
import {
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  HammerIcon,
} from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@vimmer/ui/components/input";
import * as React from "react";
import {
  CompetitionClass,
  DeviceGroup,
  ParticipantVerification,
  ValidationResult,
  Participant,
  Topic,
  Submission,
} from "@vimmer/api/db/types";
import { useMemo, useState } from "react";
import { ValidationStatusBadge } from "@/components/validation-status-badge";

interface ParticipantItemProps {
  verification: ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  };
  topics: Topic[];
  baseThumbnailUrl: string;
}

interface VerifiedParticipantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verifications: (ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  })[];
  topics: Topic[];
  baseThumbnailUrl: string;
}

const parseFileNameForOrderIndex = (fileName: string): number | null => {
  const parts = fileName.split("/");
  if (parts.length < 3) return null;

  const fileNamePart = parts[2];
  if (!fileNamePart) return null;

  const parsedNumber = parseInt(fileNamePart, 10) - 1;
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
  topics: Topic[]
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

export function VerifiedParticipantsSheet({
  open,
  onOpenChange,
  verifications,
  topics,
  baseThumbnailUrl,
}: VerifiedParticipantsSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVerifications = useMemo(() => {
    if (!searchTerm) return verifications;

    const lowerSearch = searchTerm.toLowerCase();
    return verifications.filter(
      (v) =>
        v.participant.firstname.toLowerCase().includes(lowerSearch) ||
        v.participant.lastname.toLowerCase().includes(lowerSearch) ||
        v.participant.reference.toLowerCase().includes(lowerSearch) ||
        v.participant.email?.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, verifications]);

  return (
    <Sheet modal={true} onOpenChange={onOpenChange} open={open}>
      <SheetContent
        hideClose
        side="bottom"
        className="h-[90dvh] p-0 rounded-t-xl"
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-4 flex flex-row items-center justify-between border-b">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="ghost"
              className="text-sm font-medium"
            >
              Close
            </Button>
            <SheetTitle className="text-base font-medium">
              Verified Participants
            </SheetTitle>
            <div className="w-16" /> {/* Spacer for alignment */}
          </div>

          <div className="px-4 py-3 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                className="pl-9 pr-4 bg-secondary rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredVerifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No verified participants found
              </div>
            ) : (
              <div className="divide-y">
                {filteredVerifications.map((verification) => (
                  <ParticipantItem
                    key={verification.id}
                    verification={verification}
                    topics={topics}
                    baseThumbnailUrl={baseThumbnailUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ParticipantItem({
  verification,
  topics,
  baseThumbnailUrl,
}: ParticipantItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(
    new Set()
  );
  const [globalExpanded, setGlobalExpanded] = useState(false);

  const issueCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed" && !v.overruled
  ).length;

  const groupedValidations = groupValidationsBySubmission(
    verification.participant.validationResults,
    verification.participant.submissions,
    topics
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
        {validation.outcome === "failed" && validation.overruled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground border border-muted-foreground">
            <HammerIcon className="h-3 w-3" /> Overruled
          </span>
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
    <div>
      <button
        type="button"
        className="w-full p-4 flex items-center justify-between focus:outline-none transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div>
          <div className="font-medium">
            {verification.participant.firstname}{" "}
            {verification.participant.lastname}
          </div>
          <div className="text-sm text-muted-foreground">
            Participant: {verification.participant.reference}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {issueCount > 0 ? (
            <div className="flex items-center text-amber-500">
              <XCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">{issueCount} issues</span>
            </div>
          ) : (
            <div className="flex items-center text-green-500">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Verified</span>
            </div>
          )}
          <span className="ml-2">
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="bg-muted px-4 pb-4 pt-2">
          <h4 className="text-xs text-muted-foreground mb-3">
            Validation Results
          </h4>
          {verification.participant.validationResults.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No validation results
            </div>
          ) : (
            <div className="space-y-4">
              {groupedValidations.global.length > 0 && (
                <div className="border border-border rounded-lg bg-card shadow-sm">
                  <button
                    onClick={toggleGlobalExpanded}
                    className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted/30 rounded-lg transition-colors justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">
                        General Validations
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(() => {
                          const errorCount = groupedValidations.global.filter(
                            (v) =>
                              v.severity === "error" && v.outcome === "failed"
                          ).length;
                          const warningCount = groupedValidations.global.filter(
                            (v) =>
                              v.severity === "warning" && v.outcome === "failed"
                          ).length;
                          const passedCount = groupedValidations.global.filter(
                            (v) => v.outcome === "passed"
                          ).length;
                          const skippedCount = groupedValidations.global.filter(
                            (v) => v.outcome === "skipped"
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
                    {globalExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {globalExpanded && (
                    <div className="border-t border-border bg-muted/20">
                      <div className="space-y-3  p-3 rounded-lg">
                        {groupedValidations.global.map(renderValidationItem)}
                      </div>
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
                                  v.outcome === "failed"
                              ).length;
                              const warningCount = validations.filter(
                                (v) =>
                                  v.severity === "warning" &&
                                  v.outcome === "failed"
                              ).length;
                              const passedCount = validations.filter(
                                (v) => v.outcome === "passed"
                              ).length;
                              const skippedCount = validations.filter(
                                (v) => v.outcome === "skipped"
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
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
