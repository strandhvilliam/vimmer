"use client";
import { Search, Send, Mail } from "lucide-react";
import { Badge } from "@vimmer/ui/components/badge";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "@vimmer/ui/components/input";
import { JuryInvitation } from "@vimmer/supabase/types";

export function JuryInvitationsList({
  domain,
  invitationsPromise,
}: {
  domain: string;
  invitationsPromise: Promise<JuryInvitation[]>;
}) {
  const { invitationId } = useParams();
  const invitations = use(invitationsPromise);

  const [search, setSearch] = useState("");
  const [filteredInvitations, setFilteredInvitations] = useState(invitations);

  useEffect(() => {
    const filtered = invitations.filter((invitation) =>
      invitation.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredInvitations(filtered);
  }, [search, invitations]);

  const getStatusBadge = (status: JuryInvitation["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-600">Pending</Badge>;
    }
  };

  return (
    <>
      <div className="relative mx-2">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invitations..."
          className="pl-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1 bg-background">
        <div className="space-y-2 p-2">
          {filteredInvitations.length === 0 && (
            <div className="text-center text-muted-foreground">
              No invitations found
            </div>
          )}
          {filteredInvitations.map((invitation) => (
            <Link
              key={invitation.id}
              href={`/${domain}/jury/${invitation.id}`}
              className={`block w-full p-2 text-left transition-colors rounded-md ${
                String(invitationId) === String(invitation.id)
                  ? "bg-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="font-medium truncate">{invitation.email}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
