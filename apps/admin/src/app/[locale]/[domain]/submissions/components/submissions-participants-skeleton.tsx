import React from "react";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function SubmissionsParticipantsTabSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="bg-muted/50 h-10 border-b flex items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="px-4 flex-1" key={i}>
              <Skeleton className="h-4 w-full max-w-24" />
            </div>
          ))}
        </div>

        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              className="flex items-center h-12 border-b last:border-b-0"
              key={i}
            >
              {Array.from({ length: 6 }).map((_, j) => (
                <div className="px-4 flex-1" key={j}>
                  <Skeleton className="h-4 w-full max-w-24" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SubmissionsParticipantsTabSkeleton;
