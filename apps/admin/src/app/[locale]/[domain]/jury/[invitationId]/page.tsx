"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { Badge } from "@vimmer/ui/components/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "@vimmer/ui/hooks/use-toast";

import { getJuryInvitationsByMarathon } from "@vimmer/supabase/queries";
import { JuryInvitation } from "@vimmer/supabase/mutations";
import { Skeleton } from "@vimmer/ui/components/skeleton";

// Mock function to get a jury invitation by ID
// In a real app, this would be in the supabase/queries module
async function getJuryInvitationById(id: number): Promise<JuryInvitation> {
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // Get all invitations and find the one with the matching ID
    const allInvitations = await getJuryInvitationsByMarathon(1);
    const invitation = allInvitations.find((inv) => Number(inv.id) === id);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    return invitation;
  } catch (error) {
    console.error("Error fetching invitation:", error);
    throw error;
  }
}

// Mock data for dropdowns (same as in create page)
const MOCK_CLASSES = [
  { id: 1, name: "Open Class" },
  { id: 2, name: "Junior Class" },
  { id: 3, name: "Professional" },
];

const MOCK_DEVICE_GROUPS = [
  { id: 1, name: "DSLR" },
  { id: 2, name: "Smartphone" },
  { id: 3, name: "Mirrorless" },
];

const MOCK_TOPICS = [
  { id: 1, name: "Nature" },
  { id: 2, name: "Urban" },
  { id: 3, name: "Portrait" },
  { id: 4, name: "Abstract" },
];

export default function JuryInvitationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const invitationId = params.invitationId as string;

  const [invitation, setInvitation] = useState<JuryInvitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvitation() {
      try {
        // In a real app, you'd fetch from the database
        const data = await getJuryInvitationById(parseInt(invitationId));
        setInvitation(data);
      } catch (error) {
        console.error("Failed to load jury invitation:", error);
        toast({
          title: "Error",
          description: "Failed to load jury invitation details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [invitationId]);

  const getStatusBadge = (status: JuryInvitation["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getClassName = (id: number | null) => {
    if (!id) return "All classes";
    const cls = MOCK_CLASSES.find((c) => c.id === id);
    return cls ? cls.name : "Unknown";
  };

  const getDeviceGroupName = (id: number | null) => {
    if (!id) return "All devices";
    const group = MOCK_DEVICE_GROUPS.find((g) => g.id === id);
    return group ? group.name : "Unknown";
  };

  const getTopicName = (id: number | null) => {
    if (!id) return "All topics";
    const topic = MOCK_TOPICS.find((t) => t.id === id);
    return topic ? topic.name : "Unknown";
  };

  const handleResendInvitation = () => {
    toast({
      title: "Invitation resent",
      description: `Jury invitation resent to ${invitation?.email}`,
    });
  };

  const handleDeleteInvitation = () => {
    toast({
      title: "Invitation deleted",
      description: "Jury invitation has been deleted",
    });
    router.push("/jury");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Invitation not found</h2>
          <p className="text-muted-foreground mb-6">
            The jury invitation you're looking for doesn't exist or has been
            deleted.
          </p>
          <Button onClick={() => router.push("/jury")}>
            Back to Jury List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jury Invitation</h1>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleResendInvitation}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteInvitation}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            {invitation.email}
          </CardTitle>
          <CardDescription>
            Invitation sent on{" "}
            {new Date(invitation.sent_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Status
              </h3>
              {getStatusBadge(invitation.status)}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Expiration
              </h3>
              <p>{new Date(invitation.expires_at).toLocaleDateString()}</p>
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
                    <TableCell>
                      {getClassName(invitation.competition_class_id)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Device Group</TableCell>
                    <TableCell>
                      {getDeviceGroupName(invitation.device_group_id)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Topic</TableCell>
                    <TableCell>{getTopicName(invitation.topic_id)}</TableCell>
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
    </div>
  );
}
