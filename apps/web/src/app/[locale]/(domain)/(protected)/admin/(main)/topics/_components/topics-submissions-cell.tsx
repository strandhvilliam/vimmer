import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { TooltipProvider } from "@vimmer/ui/components/tooltip";
import { Row } from "@tanstack/react-table";
import React from "react";
import { Topic } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import { Images } from "lucide-react";
import { ExternalLink } from "lucide-react";

interface TopicsSubmissionsCellProps {
  row: Row<Topic & { submissionCount?: number }>;
}

export function TopicsSubmissionsCell({ row }: TopicsSubmissionsCellProps) {
  const count = row.original.submissionCount ?? 0;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-8 hover:bg-accent group"
            onClick={() => {
              console.log("Show submissions for topic", row.id);
            }}
          >
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{count}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View submissions for this topic</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
