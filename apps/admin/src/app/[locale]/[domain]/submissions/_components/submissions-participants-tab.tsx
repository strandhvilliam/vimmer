import { getParticipantsByDomain } from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SubmissionsParticipantsTable } from "./submissions-participants-table";

export default async function SubmissionsParticipantsTab() {
  const cookieStore = await cookies();
  const domain = cookieStore.get("activeDomain")?.value;

  if (!domain) {
    notFound();
  }

  const participants = await getParticipantsByDomain(domain);

  return (
    <SubmissionsParticipantsTable participants={participants} domain={domain} />
  );
}
