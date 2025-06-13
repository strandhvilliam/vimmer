import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Button } from "@vimmer/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { format } from "date-fns";
import { Mail, Trash2, User2Icon, Pencil } from "lucide-react";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { notFound } from "next/navigation";
import { AcceptedParticipantsTable } from "./accepted-participants-table";
import { Badge } from "@vimmer/ui/components/badge";
import {
  getParticipantsByDomain,
  getParticipantVerificationsByStaffId,
  getStaffMemberById,
} from "@vimmer/supabase/cached-queries";

const staffMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    lastLogin: new Date(),
    role: "admin" as const,
    submissions: [
      {
        id: 1,
        participantName: "Alice Smith",
        participantNumber: "P001",
        topic: "Nature",
        acceptedAt: new Date(2024, 2, 15, 14, 30),
      },
      {
        id: 2,
        participantName: "Bob Johnson",
        participantNumber: "P002",
        topic: "Urban Life",
        acceptedAt: new Date(2024, 2, 15, 15, 45),
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    lastLogin: new Date(2024, 2, 15),
    role: "user" as const,
    submissions: [],
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    lastLogin: new Date(2024, 2, 14),
    role: "user" as const,
    submissions: [],
  },
];

async function demoGetStaffMember(staffId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return staffMembers.find((s) => s.id === Number(staffId));
}

interface PageProps {
  params: Promise<{
    domain: string;
    staffId: string;
  }>;
}

export default async function StaffDetailsPage({ params }: PageProps) {
  const { staffId, domain } = await params;
  const staff = await getStaffMemberById(Number(staffId));

  if (!staff) {
    notFound();
  }
  const participants = await getParticipantsByDomain(domain);

  const verifications = await getParticipantVerificationsByStaffId(
    staff.user.id
  );

  const submissions = participants.filter((participant) =>
    verifications.some(
      (verification) => verification.participantId === participant.id
    )
  );

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
        <AcceptedParticipantsTable submissions={[]} />
      </ScrollArea>
    </>
  );
}
