"use client";

import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@vimmer/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@vimmer/ui/components/table";
import { JuryStatusBadge } from "./jury-status-badge";
import {
  CompetitionClass,
  DeviceGroup,
  JuryInvitation,
  Topic,
} from "@vimmer/api/db/types";

interface InvitationDetailCardProps {
  invitation: JuryInvitation;
  competitionClasses: CompetitionClass[];
  topics: Topic[];
  deviceGroups: DeviceGroup[];
}

export function InvitationDetailCard({
  invitation,
  competitionClasses,
  topics,
  deviceGroups,
}: InvitationDetailCardProps) {
  const className = competitionClasses.find(
    (c) => c.id === invitation.competitionClassId,
  );
  const deviceGroup = deviceGroups.find(
    (g) => g.id === invitation.deviceGroupId,
  );
  const topic = topics.find((t) => t.id === invitation.topicId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          {invitation.email}
        </CardTitle>
        <CardDescription>
          Invitation sent on{" "}
          {new Date(invitation.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Status
            </h3>
            <JuryStatusBadge status={invitation.status} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Expiration
            </h3>
            <p>{new Date(invitation.expiresAt).toLocaleDateString()}</p>
          </div>

          {invitation.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Notes
              </h3>
              <p className="text-sm">{invitation.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Submission Filters
            </h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Competition Class
                  </TableCell>
                  <TableCell>{className?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Device Group</TableCell>
                  <TableCell>{deviceGroup?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Topic</TableCell>
                  <TableCell>{topic?.name}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Token:{" "}
          <code className="bg-muted p-1 rounded">
            {invitation.token.substring(0, 16)}...
          </code>
        </div>
      </CardFooter>
    </Card>
  );
}
