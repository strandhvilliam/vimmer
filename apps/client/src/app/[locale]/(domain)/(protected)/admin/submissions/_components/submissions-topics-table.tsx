"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";

export function SubmissionsTopicsTable() {
  // TODO: Implement topics view with submission counts
  // This could show topics grouped by submission count, status, etc.
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Topics View coming soon</p>
    </div>
  );
}
