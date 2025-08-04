import { SearchIcon, CheckCircleIcon, AlertTriangle } from "lucide-react";
import { Input } from "@vimmer/ui/components/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@vimmer/ui/components/accordion";
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
import { useMemo } from "react";
import { DrawerTitle } from "@vimmer/ui/components/drawer";
import { parseAsString, useQueryState } from "nuqs";
import { DrawerLayout } from "./drawer-layout";
import { ValidationAccordion } from "./validation-accordion";

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

export function VerifiedParticipantsSheet({
  open,
  onOpenChange,
  verifications,
  topics,
  baseThumbnailUrl,
}: VerifiedParticipantsSheetProps) {
  const [query, setQuery] = useQueryState("vpg", parseAsString);

  const filteredVerifications = useMemo(() => {
    if (!query) return verifications;

    const lowerSearch = query.toLowerCase();
    return verifications.filter(
      (v) =>
        v.participant.firstname.toLowerCase().includes(lowerSearch) ||
        v.participant.lastname.toLowerCase().includes(lowerSearch) ||
        v.participant.reference.toLowerCase().includes(lowerSearch) ||
        v.participant.email?.toLowerCase().includes(lowerSearch),
    );
  }, [query, verifications]);

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 pb-3">
          <DrawerTitle className="text-xl font-bold font-rocgrotesk text-center mb-4">
            Verified Participants
          </DrawerTitle>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 text-muted-foreground" />
            <Input
              placeholder="Search by name or participant number..."
              className="pl-10 pr-4 h-10 bg-background/60 backdrop-blur-sm border rounded-full text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              value={query ?? ""}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {filteredVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <SearchIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-muted-foreground mb-1">
                No participants found
              </p>
              <p className="text-sm text-muted-foreground/70">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="space-y-2">
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
    </DrawerLayout>
  );
}

function ParticipantItem({
  verification,
  topics,
  baseThumbnailUrl,
}: ParticipantItemProps) {
  const warningsCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed" && !v.overruled && v.severity === "warning",
  ).length;

  const errorsCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed" && !v.overruled && v.severity === "error",
  ).length;

  return (
    <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="participant" className="border-none">
          <AccordionTrigger className="w-full p-4 flex items-center justify-between focus:outline-none transition-all hover:no-underline hover:bg-muted/30 rounded-xl">
            <div className="flex flex-col min-w-0">
              <div className=" text-base text-foreground truncate">
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
                      <span className="text-xs font-medium text-green-700">
                        OK
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/30 backdrop-blur-sm px-4 pb-4 pt-3 rounded-b-xl">
            <ValidationAccordion
              validationResults={verification.participant.validationResults}
              submissions={verification.participant.submissions}
              topics={topics}
              competitionClass={verification.participant.competitionClass}
              baseThumbnailUrl={baseThumbnailUrl}
              showOverruleButtons={false}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
