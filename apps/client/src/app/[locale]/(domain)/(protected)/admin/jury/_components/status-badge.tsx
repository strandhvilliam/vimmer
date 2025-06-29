"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@vimmer/ui/components/badge";
import { JuryInvitation } from "@vimmer/supabase/types";

interface StatusBadgeProps {
  status: JuryInvitation["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-blue-600">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status
            ? String(status).charAt(0).toUpperCase() + String(status).slice(1)
            : "Pending"}
        </Badge>
      );
  }
}
