import React from "react";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 container py-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-56" />
      </div>

      <div className="rounded-md border">
        {/* Table header */}
        <div className="bg-muted/50 h-10 border-b flex items-center">
          {/* Severity column */}
          <div className="px-4 w-[120px]">
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Participant column */}
          <div className="px-4 w-[200px]">
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Message column (flexible width) */}
          <div className="px-4 flex-1">
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          {/* Rule column */}
          <div className="px-4 w-[150px]">
            <Skeleton className="h-4 w-20" />
          </div>
          {/* File column */}
          <div className="px-4 w-[180px]">
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Date column */}
          <div className="px-4 w-[180px]">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Table rows */}
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              className="flex items-center h-12 border-b last:border-b-0"
              key={i}
            >
              {/* Severity column with badge-like appearance */}
              <div className="px-4 w-[120px]">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              {/* Participant column */}
              <div className="px-4 w-[200px]">
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Message column (flexible width) */}
              <div className="px-4 flex-1">
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Rule column */}
              <div className="px-4 w-[150px]">
                <Skeleton className="h-4 w-24" />
              </div>
              {/* File column */}
              <div className="px-4 w-[180px]">
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Date column */}
              <div className="px-4 w-[180px]">
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Count text */}
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
