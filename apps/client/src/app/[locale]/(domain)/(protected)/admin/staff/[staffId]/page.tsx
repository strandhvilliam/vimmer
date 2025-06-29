import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { notFound } from "next/navigation";
import { AcceptedParticipantsTable } from "./accepted-participants-table";
import { StaffHeader } from "./staff-header";
import {
  getMarathonByDomain,
  getParticipantVerificationsByStaffId,
  getStaffMemberById,
} from "@vimmer/supabase/cached-queries";

interface PageProps {
  params: Promise<{
    domain: string;
    staffId: string;
  }>;
}

export default async function StaffDetailsPage({ params }: PageProps) {
  const { domain, staffId } = await params;
  const marathon = await getMarathonByDomain(domain);
  if (!marathon) {
    notFound();
  }
  const staff = await getStaffMemberById(staffId, marathon.id);

  if (!staff) {
    notFound();
  }

  const verifications = (
    await getParticipantVerificationsByStaffId(staff.userId)
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <StaffHeader
        staff={staff}
        staffId={staffId}
        domain={domain}
        marathonId={marathon.id}
      />

      <ScrollArea className="flex-1 p-8">
        <AcceptedParticipantsTable verifications={verifications} />
      </ScrollArea>
    </>
  );
}
