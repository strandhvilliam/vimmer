import { Button } from "@vimmer/ui/components/button";
import { Sheet, SheetContent, SheetTitle } from "@vimmer/ui/components/sheet";
import { SearchIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Input } from "@vimmer/ui/components/input";
import * as React from "react";
import { useEffect } from "react";
import { useDomain } from "@/hooks/use-domain";
import { createClient } from "@vimmer/supabase/browser";

// Define types based on database schema
interface Participant {
  id: number;
  marathon_id: number;
  firstname: string;
  lastname: string;
  email: string | null;
  reference: string;
  domain: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  competition_class_id: number | null;
  device_group_id: number | null;
  upload_count: number;
}

interface ValidationResult {
  id: number;
  participant_id: number;
  rule_key: string;
  message: string;
  severity: string;
  outcome: string;
  created_at: string;
  updated_at: string | null;
  file_name: string | null;
}

interface VerifiedParticipantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number;
}

export function VerifiedParticipantsSheet({
  open,
  onOpenChange,
  refreshTrigger = 0,
}: VerifiedParticipantsSheetProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [participants, setParticipants] = React.useState<
    (Participant & {
      validation_results: ValidationResult[];
    })[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const domain = useDomain();

  // Fetch verified participants
  const fetchVerifiedParticipants = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("participants")
        .select(
          `
          *,
          validation_results (*)
        `
        )
        .eq("domain", domain)
        .eq("status", "verified")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching verified participants:", error);
        return;
      }

      setParticipants(data || []);
    } catch (error) {
      console.error("Error fetching verified participants:", error);
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  // Fetch data when the sheet opens or when refreshTrigger changes
  useEffect(() => {
    if (open) {
      fetchVerifiedParticipants();
    }
  }, [open, refreshTrigger, fetchVerifiedParticipants]);

  const filteredParticipants = React.useMemo(() => {
    if (!searchTerm) return participants;

    const lowerSearch = searchTerm.toLowerCase();
    return participants.filter(
      (p) =>
        p.firstname.toLowerCase().includes(lowerSearch) ||
        p.lastname.toLowerCase().includes(lowerSearch) ||
        p.reference.toLowerCase().includes(lowerSearch) ||
        p.email?.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, participants]);

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
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No verified participants found
              </div>
            ) : (
              <div className="divide-y">
                {filteredParticipants.map((participant) => (
                  <ParticipantItem
                    key={participant.id}
                    participant={participant}
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
  participant,
}: {
  participant: Participant & {
    validation_results: ValidationResult[];
  };
}) {
  const [expanded, setExpanded] = React.useState(false);

  // Sort validation results to show failures first
  const sortedValidations = React.useMemo(() => {
    return [...(participant.validation_results || [])].sort((a, b) => {
      if (a.outcome === "failure" && b.outcome !== "failure") return -1;
      if (a.outcome !== "failure" && b.outcome === "failure") return 1;
      return 0;
    });
  }, [participant.validation_results]);

  return (
    <div className="py-3 px-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-medium">
            {participant.firstname} {participant.lastname}
          </h3>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-mono">{participant.reference}</span>
            {participant.email && <span>• {participant.email}</span>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Hide" : "Details"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 pl-1">
          <h4 className="text-sm font-medium text-muted-foreground">
            Validation Results
          </h4>
          <div className="space-y-2">
            {sortedValidations.length > 0 ? (
              sortedValidations.map((validation) => (
                <div
                  key={validation.id}
                  className="flex items-start gap-2 text-sm"
                >
                  {validation.outcome === "success" ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span
                    className={
                      validation.outcome === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {validation.message}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No validation results available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
