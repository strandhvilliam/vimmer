import { getSession } from "@/lib/auth";
import {
  getParticipantVerificationsByStaffId,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { redirect } from "next/navigation";
import { StaffInterface } from "./_components/staff-interface";
import { getDomain } from "@/lib/get-domain";

export default async function StaffPage() {
  const sessionData = await getSession();
  const domain = await getDomain();

  if (!sessionData) {
    redirect("/staff/login");
  }

  const { user } = sessionData;

  const verifications = await getParticipantVerificationsByStaffId(user.id);
  const topics = await getTopicsByDomain(domain);

  return (
    <StaffInterface
      staffName={user.name}
      verifications={verifications}
      topics={topics}
    />
  );
}
