import { TooltipProvider } from "@vimmer/ui/components/tooltip";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { Button } from "@vimmer/ui/components/button";
import { Edit, Trash2 } from "lucide-react";

interface TopicsActionCellProps {
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function TopicsActionCell({
  onEditClick,
  onDeleteClick,
}: TopicsActionCellProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit topic</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/50"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
