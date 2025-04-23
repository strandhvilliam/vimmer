"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  Users,
  UploadCloud,
  AlertCircle,
  Hourglass,
  CheckCircle,
} from "lucide-react";
import { ParticipantStatus } from "@vimmer/supabase/types";

interface DashboardCardsProps {
  totalParticipants: number;
  totalUploads: number;
  statusCounts: Record<ParticipantStatus, number>;
  errorCount: number;
  warningCount: number;
}

export function DashboardCards({
  totalParticipants,
  totalUploads,
  statusCounts,
  errorCount,
  warningCount,
}: DashboardCardsProps) {
  const verifiedCount = statusCounts.verified;

  const inProgressCount =
    totalParticipants +
    statusCounts.ready_to_upload +
    statusCounts.processing +
    statusCounts.initialized +
    statusCounts.completed;

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
