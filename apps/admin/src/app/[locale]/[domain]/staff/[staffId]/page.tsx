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

const staffMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    lastLogin: new Date(),
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
    submissions: [],
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    lastLogin: new Date(2024, 2, 14),
    submissions: [],
  },
];

async function demoGetStaffMember(staffId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return staffMembers.find((s) => s.id === Number(staffId));
}

interface PageProps {
  params: Promise<{
    staffId: string;
  }>;
}

export default async function StaffDetailsPage({ params }: PageProps) {
  const { staffId } = await params;
  const staff = await demoGetStaffMember(staffId);

  if (!staff) {
    notFound();
  }

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
              <h2 className="text-xl font-semibold">{staff.name}</h2>
              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {staff.email}
              </div>
              <p className="text-sm text-muted-foreground">
                Last login: {format(staff.lastLogin, "PPp")}
              </p>
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
        <AcceptedParticipantsTable submissions={staff.submissions} />
      </ScrollArea>
    </>
  );
}
