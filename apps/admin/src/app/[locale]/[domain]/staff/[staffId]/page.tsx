import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Button } from "@vimmer/ui/components/button";
import { Mail, Trash2, User2Icon, Pencil } from "lucide-react";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { notFound } from "next/navigation";
import { AcceptedParticipantsTable } from "./accepted-participants-table";
import { Badge } from "@vimmer/ui/components/badge";
import { RefreshButton } from "./refresh-button";
import {
  getParticipantVerificationsByStaffId,
  getStaffMemberById,
} from "@vimmer/supabase/cached-queries";

interface PageProps {
  params: Promise<{
    staffId: string;
  }>;
}

export default async function StaffDetailsPage({ params }: PageProps) {
  const { staffId } = await params;
  const staff = await getStaffMemberById(staffId);

  if (!staff) {
    notFound();
  }

  const verifications = (
    await getParticipantVerificationsByStaffId(staff.userId)
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  console.log({ verifications });

  return (
    <>
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 ">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <User2Icon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{staff.user.name}</h2>
                <Badge
                  variant={staff.role === "admin" ? "default" : "secondary"}
                >
                  {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {staff.user.email}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <RefreshButton staffId={staffId} />
            <Button size="sm" variant="outline">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-8">
        <AcceptedParticipantsTable verifications={verifications} />
      </ScrollArea>
    </>
  );
}
