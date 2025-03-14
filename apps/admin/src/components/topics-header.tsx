"use client";

import { Button } from "@vimmer/ui/components/button";
import { SlidersHorizontal } from "lucide-react";
import { AddTopicButton } from "./add-topic-button";

interface TopicsHeaderProps {
  marathonId: string;
}

export function TopicsHeader({ marathonId }: TopicsHeaderProps) {
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your marathon topics. Drag topics to reorder
              them.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">Tasks</Button>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <AddTopicButton marathonId={parseInt(marathonId)} />
          </div>
        </div>
      </div>
    </div>
  );
}
