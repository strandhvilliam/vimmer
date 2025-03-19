"use client";

import { CompetitionClass } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import { Card } from "@vimmer/ui/components/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@vimmer/ui/components/tooltip";
import { XIcon } from "lucide-react";
import React from "react";

interface CompetitionClassListProps {
  classes: CompetitionClass[];
}

export default function CompetitionClassList({
  classes,
}: CompetitionClassListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {classes.map((classItem) => (
        <Card key={classItem.id} className="relative">
          <div className="flex flex-col gap-2 p-4">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 p-0 hover:bg-transparent"
              size="icon"
            >
              <XIcon className="w-4 h-4" />
            </Button>
            <div className="flex h-fit items-center w-fit justify-center bg-muted rounded-lg shadow-sm border p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-6 h-6 text-center text-lg font-medium font-mono">
                    {classItem.numberOfPhotos}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Number of photos: {classItem.numberOfPhotos}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col tems-center justify-between">
              <h3 className="text-lg font-semibold">{classItem.name}</h3>
              <p className="text-sm text-muted-foreground">
                {classItem.description}
              </p>
            </div>
          </div>
          <div className="flex items-center px-4 pb-4 gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              View Submissions
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
