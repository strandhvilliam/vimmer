"use client";

import { Button } from "@vimmer/ui/components/button";
import { SlidersHorizontal } from "lucide-react";
import { AddTopicButton } from "../add-topic-button";

interface TopicsHeaderProps {
  marathonId: number;
}

export function TopicsHeader({ marathonId }: TopicsHeaderProps) {
  return (
    <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your marathon topics. Drag topics to reorder
              them.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AddTopicButton marathonId={marathonId} />
          </div>
        </div>
      </div>
    </div>
  );
}
