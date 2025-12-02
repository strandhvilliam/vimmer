"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Users, UploadCloud, AlertCircle, Hourglass } from "lucide-react";
import { Participant, PARTICIPANT_STATUS } from "@vimmer/supabase/types";
import {
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "../../../../../packages/validation/old/constants";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { useTRPC } from "@/trpc/client";

export function DashboardCards() {
  const trpc = useTRPC();
  const { domain } = useDomain();

  const { data: participants } = useSuspenseQuery(
    trpc.participants.getByDomain.queryOptions({ domain }),
  );

  const totalParticipants = participants.length;
  const totalUploads = participants.reduce(
    (acc: number, p: Participant) => acc + p.uploadCount,
    0,
  );

  const { inProgressCount, verifiedCount } = participants.reduce(
    (acc, p) => {
      if (p.status === PARTICIPANT_STATUS.VERIFIED) {
        acc.verifiedCount++;
      } else {
        acc.inProgressCount++;
      }
      return acc;
    },
    { inProgressCount: 0, verifiedCount: 0 } as {
      verifiedCount: number;
      inProgressCount: number;
    },
  );

  const validationIssues = participants.flatMap(
    (p) => p.validationResults || [],
  );

  const errorCount = validationIssues.filter(
    (v) =>
      v.severity === SEVERITY_LEVELS.ERROR &&
      v.outcome === VALIDATION_OUTCOME.FAILED,
  ).length;
  const warningCount = validationIssues.filter(
    (v) =>
      v.severity === SEVERITY_LEVELS.WARNING &&
      v.outcome === VALIDATION_OUTCOME.FAILED,
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-background">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
          <CardTitle className="text-sm font-medium">
            Total Participants
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-xl font-bold">{totalParticipants}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently active participants
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
          <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
          <UploadCloud className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-xl font-bold">{totalUploads}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all participants
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
          <CardTitle className="text-sm font-medium">
            Participant Status
          </CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-xl font-bold text-amber-500">
                {inProgressCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                in progress
              </span>
            </div>
            <div className="text-muted-foreground">/</div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-green-500">
                {verifiedCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                verified
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
          <CardTitle className="text-sm font-medium">Issues</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-xl font-bold text-red-500">
                {errorCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1">errors</span>
            </div>
            <div className="text-muted-foreground">/</div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-amber-500">
                {warningCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                warnings
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
