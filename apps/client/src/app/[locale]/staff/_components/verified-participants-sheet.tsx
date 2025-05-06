import { Button } from "@vimmer/ui/components/button";
import { Sheet, SheetContent, SheetTitle } from "@vimmer/ui/components/sheet";
import { SearchIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
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

interface ParticipantItemProps {
  verification: ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  };
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
      <SheetContent hideClose side="bottom" className="h-[95vh] p-0">
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

function ParticipantItem({ verification }: ParticipantItemProps) {
  // Count validation issues (simplistic approach)
  const issueCount = verification.participant.validationResults?.filter(
    (v) => v.outcome === "failed"
  ).length;

  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">
          {verification.participant.firstname}{" "}
          {verification.participant.lastname}
        </div>
        <div className="text-sm text-muted-foreground">
          Participant: {verification.participant.reference}
        </div>
      </div>
      <div className="flex items-center">
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
      </div>
    </div>
  );
}
