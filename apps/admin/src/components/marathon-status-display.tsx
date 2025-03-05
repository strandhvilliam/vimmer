"use client";

import { Badge } from "@vimmer/ui/components/badge";
import { Button } from "@vimmer/ui/components/button";
import { differenceInDays, differenceInSeconds, format } from "date-fns";
import { useEffect, useState } from "react";

interface MarathonStatusDisplayProps {
  marathonStartDate?: string | null;
  marathonEndDate?: string | null;
  isSetupComplete?: boolean;
}

function formatCountdown(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function MarathonStatusDisplay({
  marathonStartDate,
  marathonEndDate,
  isSetupComplete,
}: MarathonStatusDisplayProps) {
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [status, setStatus] = useState<
    "not-setup" | "upcoming" | "live" | "ended"
  >("upcoming");

  return (
    <div className="flex items-center gap-4">
      {status === "not-setup" && (
        <Button variant="default" size="sm">
          Finish marathon setup
        </Button>
      )}
      {status === "upcoming" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Upcoming</Badge>
          <span className="text-sm font-medium">{countdown}</span>
        </div>
      )}
      {status === "live" && (
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className="bg-green-500 hover:bg-green-500/80"
          >
            LIVE
          </Badge>
          <span className="text-sm font-medium">{countdown}</span>
        </div>
      )}
      {status === "ended" && <Badge variant="secondary">Ended</Badge>}
    </div>
  );
}
