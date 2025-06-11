import React from "react";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Tabs Section Skeleton */}
      <Tabs defaultValue="participants">
        <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
          <TabsTrigger
            value="participants"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
            disabled
          >
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger
            value="topics"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
            disabled
          >
            <Skeleton className="h-4 w-16" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-72 rounded-lg" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
              {/* Table Header */}
              <div className="bg-muted/50 h-10 border-b flex items-center">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div className="px-4 flex-1" key={i}>
                    <Skeleton className="h-4 w-full max-w-24" />
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              <div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    className="flex items-center h-12 border-b last:border-b-0"
                    key={i}
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div className="px-4 flex-1" key={j}>
                        {j === 0 ? (
                          // First column - participant reference
                          <Skeleton className="h-4 w-16" />
                        ) : j === 1 ? (
                          // Second column - name
                          <Skeleton className="h-4 w-32" />
                        ) : j === 2 ? (
                          // Third column - status badge
                          <Skeleton className="h-6 w-20 rounded-full" />
                        ) : j === 3 ? (
                          // Fourth column - progress
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-2 w-16 rounded-full" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                        ) : j === 4 ? (
                          // Fifth column - class
                          <Skeleton className="h-4 w-24" />
                        ) : j === 5 ? (
                          // Sixth column - device
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ) : (
                          // Last column - date
                          <Skeleton className="h-4 w-20" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="mt-6">
          <div className="space-y-4">
            {/* Topics tab skeleton - simpler grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
