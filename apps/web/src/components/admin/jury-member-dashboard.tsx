"use client";

import React from "react";
import {
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import { Button } from "@vimmer/ui/components/button";
import { Progress } from "@vimmer/ui/components/progress";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { JuryInvitationNotFound } from "@/components/admin/jury-invitation-not-found";
import { JuryStatusBadge } from "@/components/admin/jury-status-badge";

interface JuryMemberDashboardProps {
  invitationId: number;
}

export function JuryMemberDashboard({
  invitationId,
}: JuryMemberDashboardProps) {
  const trpc = useTRPC();
  const { domain } = useDomain();

  const { data: invitation } = useSuspenseQuery(
    trpc.jury.getJuryInvitationById.queryOptions({
      id: invitationId,
    }),
  );

  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: deviceGroups } = useSuspenseQuery(
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
  );

  if (!invitation) {
    return <JuryInvitationNotFound />;
  }

  const className = competitionClasses.find(
    (c) => c.id === invitation.competitionClassId,
  );
  const deviceGroup = deviceGroups.find(
    (g) => g.id === invitation.deviceGroupId,
  );
  const topic = topics.find((t) => t.id === invitation.topicId);

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(invitation.expiresAt).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-rocgrotesk">Jury Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {invitation.displayName || invitation.email}
          </p>
        </div>
        <JuryStatusBadge status={invitation.status} />
      </div>

      {/* Status Alert */}
      {isExpired && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Invitation Expired</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This jury invitation expired on{" "}
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {!isExpired && daysUntilExpiry <= 7 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Expiring Soon</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This invitation expires in {daysUntilExpiry} day
              {daysUntilExpiry !== 1 ? "s" : ""} on{" "}
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Awaiting participant data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratings Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Participants rated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <Progress value={0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Time Remaining
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isExpired ? "Expired" : `${daysUntilExpiry}d`}
            </div>
            <p className="text-xs text-muted-foreground">
              Until {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jury Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Your Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Competition Class
              </h3>
              <Badge variant="outline" className="text-sm">
                {className?.name || "All Classes"}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Device Group
              </h3>
              <Badge variant="outline" className="text-sm">
                {deviceGroup?.name || "All Devices"}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Topic
              </h3>
              <Badge variant="outline" className="text-sm">
                {topic?.name || "All Topics"}
              </Badge>
            </div>
          </div>

          {invitation.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Special Instructions
              </h3>
              <p className="text-sm bg-muted p-3 rounded-md">
                {invitation.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button size="lg" disabled={isExpired}>
          <Users className="h-4 w-4 mr-2" />
          Start Reviewing Participants
        </Button>
        <Button variant="outline" size="lg">
          <Star className="h-4 w-4 mr-2" />
          View My Ratings
        </Button>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 font-medium">{invitation.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(invitation.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2">
                <JuryStatusBadge status={invitation.status} />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Token:</span>
              <code className="ml-2 bg-muted p-1 rounded text-xs">
                {invitation.token.substring(0, 16)}...
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
