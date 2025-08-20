"use client";

import {
  SearchIcon,
  CheckCircleIcon,
  AlertTriangle,
  X,
  ChevronRightIcon,
} from "lucide-react";
import { Input } from "@vimmer/ui/components/input";
import { Button } from "@vimmer/ui/components/button";
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

import { DrawerTitle } from "@vimmer/ui/components/drawer";
import { parseAsString, useQueryState } from "nuqs";
import { DrawerLayout } from "./drawer-layout";
import { ValidationAccordion } from "./validation-accordion";
import { format } from "date-fns";

interface ParticipantItemProps {
  verification: ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  };
  onClick: () => void;
}

interface VerifiedParticipantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownVerifications: (ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  })[];
  searchResult?:
    | (ParticipantVerification & {
        participant: Participant & {
          validationResults: ValidationResult[];
          submissions: Submission[];
          competitionClass: CompetitionClass | null;
          deviceGroup: DeviceGroup | null;
        };
      })
    | null;
  topics: Topic[];
  baseThumbnailUrl: string;
  submissionBaseUrl: string;
  previewBaseUrl: string;
  isSearchLoading?: boolean;
  onSearch?: (reference: string) => void;
}

export function VerifiedParticipantsSheet({
  open,
  onOpenChange,
  ownVerifications,
  searchResult,
  topics,
  baseThumbnailUrl,
  submissionBaseUrl,
  previewBaseUrl,
  isSearchLoading = false,
  onSearch,
}: VerifiedParticipantsSheetProps) {
  const [query, setQuery] = useQueryState("vpg", parseAsString);
  const [participantDrawerOpen, setParticipantDrawerOpen] =
    React.useState(false);
  const [selectedParticipant, setSelectedParticipant] = React.useState<
    | (Participant & {
        validationResults: ValidationResult[];
        submissions: Submission[];
        competitionClass: CompetitionClass | null;
        deviceGroup: DeviceGroup | null;
      })
    | null
  >(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      onSearch?.(value.trim());
    }
  };

  const handleClear = () => {
    setQuery(null);
  };

  const handleParticipantClick = (
    participant: Participant & {
      validationResults: ValidationResult[];
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    },
  ) => {
    setSelectedParticipant(participant);
    setParticipantDrawerOpen(true);
  };

  return (
    <>
      <DrawerLayout open={open} onOpenChange={onOpenChange}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-4 pb-3">
            <DrawerTitle className="text-xl font-bold font-rocgrotesk text-center mb-4">
              Verified Participants
            </DrawerTitle>

            {/* Search Description */}
            <p className="text-sm text-muted-foreground text-center mb-3">
              Search to find any verification by participant number. If a
              participant number is not found. They are not verified yet.
            </p>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 text-muted-foreground" />
              <Input
                placeholder="Enter participant number..."
                className="pl-10 pr-10 h-10 bg-background/60 backdrop-blur-sm border rounded-full text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                value={query ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {/* Search Result */}
            {query && (
              <div className="mb-6">
                {isSearchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">
                      Searching...
                    </div>
                  </div>
                ) : searchResult ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Search Result
                    </h3>
                    <ParticipantItem
                      verification={searchResult}
                      onClick={() =>
                        handleParticipantClick(searchResult.participant)
                      }
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <SearchIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium text-muted-foreground mb-1">
                      No verification found
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      No verification found for participant "{query}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Your Verifications */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Your Verifications
              </h3>
              {ownVerifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <SearchIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium text-muted-foreground mb-1">
                    No verifications yet
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You haven't verified any participants yet
                  </p>
                </div>
              ) : (
                ownVerifications.map((verification) => (
                  <ParticipantItem
                    key={verification.id}
                    verification={verification}
                    onClick={() =>
                      handleParticipantClick(verification.participant)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </DrawerLayout>

      {/* Participant Detail Drawer */}
      <DrawerLayout
        open={participantDrawerOpen}
        onOpenChange={setParticipantDrawerOpen}
        title="Participant Information"
      >
        {selectedParticipant && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-3 pt-6 pb-3 flex justify-center">
              <div className="flex flex-col flex-0 items-center">
                <span className="text-4xl font-bold font-rocgrotesk">
                  #{selectedParticipant.reference}
                </span>
                <div className="h-1 w-full bg-vimmer-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <div className="flex flex-col items-center gap-2 rounded-xl py-2 px-3">
                <div className="text-center">
                  <div className="text-lg font-medium text-foreground">
                    {selectedParticipant.firstname}{" "}
                    {selectedParticipant.lastname}
                  </div>
                  {selectedParticipant.email && (
                    <div className="text-sm text-muted-foreground ">
                      {selectedParticipant.email}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full justify-center">
                  <div className="flex items-center space-x-2 text-sm bg-green-100 border border-green-400 rounded-full px-3 py-1">
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <ValidationAccordion
                  validationResults={selectedParticipant.validationResults}
                  submissions={selectedParticipant.submissions}
                  topics={topics}
                  competitionClass={selectedParticipant.competitionClass}
                  baseThumbnailUrl={baseThumbnailUrl}
                  submissionBaseUrl={submissionBaseUrl}
                  previewBaseUrl={previewBaseUrl}
                  showOverruleButtons={false}
                />
              </div>
            </div>
          </div>
        )}
      </DrawerLayout>
    </>
  );
}

function ParticipantItem({ verification, onClick }: ParticipantItemProps) {
  const warningsCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed" && !v.overruled && v.severity === "warning",
  ).length;

  const errorsCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed" && !v.overruled && v.severity === "error",
  ).length;

  return (
    <div
      className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:bg-muted/30"
      onClick={onClick}
    >
      <div className="w-full p-4 flex items-center justify-between">
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">
            Finished:{" "}
            {format(
              new Date(verification.participant.createdAt),
              "yyyy-MM-dd HH:mm",
            )}
          </span>
          <div className="text-base text-foreground truncate">
            {verification.participant.firstname}{" "}
            {verification.participant.lastname}
          </div>
          <div className="flex gap-2 mt-1">
            <div className="text-sm font-semibold text-muted-foreground">
              #{verification.participant.reference}
            </div>
            <div className="flex items-center gap-2">
              {warningsCount > 0 || errorsCount > 0 ? (
                <>
                  {warningsCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-amber-50 border border-amber-200 rounded-full">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">
                        {warningsCount}
                      </span>
                    </div>
                  )}
                  {errorsCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-red-50 border border-red-200 rounded-full">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-xs font-medium text-red-700">
                        {errorsCount}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-0.5 bg-green-50 border border-green-200 rounded-full">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">OK</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
