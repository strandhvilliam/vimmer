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
} from "@vimmer/supabase/types";
import { useMemo } from "react";
import { ValidationStatusBadge } from "@/components/validation-status-badge";

interface ParticipantItemProps {
  verification: ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  };
  topics: Topic[];
}

interface VerifiedParticipantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verifications: (ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  })[];
  topics: Topic[];
}

export function VerifiedParticipantsSheet({
  open,
  onOpenChange,
  verifications,
  topics,
}: VerifiedParticipantsSheetProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

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

function getTopicIndexFromFileName(fileName: string) {
  const parts = fileName.split("/");
  if (parts.length < 3) return null;
  const topicOrderStr = parts[2];
  if (!topicOrderStr) return null;
  return parseInt(topicOrderStr, 10);
}

function getTopicNameFromFileName(fileName: string, topics: Topic[]) {
  const topicIndex = getTopicIndexFromFileName(fileName);
  if (!topicIndex) return null;
  return topics.find((t) => t.orderIndex === topicIndex - 1)?.name;
}

function ParticipantItem({ verification, topics }: ParticipantItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  // Count validation issues (simplistic approach)
  const issueCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed" && !v.overruled
  ).length;

  return (
    <div>
      <button
        type="button"
        className="w-full p-4 flex items-center justify-between hover:bg-accent focus:outline-none transition-colors"
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
        <div className="bg-muted px-6 pb-4 pt-2">
          {verification.participant.validationResults.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No validation results
            </div>
          ) : (
            <ul className="space-y-2">
              {[...verification.participant.validationResults]
                .sort((a, b) =>
                  a.outcome === "failed" ? -1 : b.outcome === "failed" ? 1 : 0
                )
                .map((result, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-20">
                      <ValidationStatusBadge
                        outcome={
                          result.outcome as "failed" | "passed" | "skipped"
                        }
                        severity={result.severity as "error" | "warning"}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className={
                          result.outcome === "passed"
                            ? "font-medium text-sm text-green-700"
                            : result.severity === "error"
                              ? "font-medium text-sm text-red-700"
                              : "font-medium text-sm text-amber-700"
                        }
                      >
                        {result.ruleKey || "Unknown rule"}
                        {result.outcome === "failed" && result.overruled && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground border border-muted-foreground">
                            <HammerIcon className="h-3 w-3" /> Overruled
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.message ||
                          (result.outcome === "failed" ? "Failed" : "Passed")}
                      </div>
                      {result.fileName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Topic: {getTopicIndexFromFileName(result.fileName)}.{" "}
                          {getTopicNameFromFileName(result.fileName, topics)}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
