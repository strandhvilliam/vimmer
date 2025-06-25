import {
  participantByReferenceTag,
  participantsByDomainTag,
} from "@vimmer/supabase/cache-tags";
import { getParticipantByIdQuery } from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const participantId = parseInt(id, 10);

  const supabase = await createClient();
  const participant = await getParticipantByIdQuery(supabase, participantId);

  if (participant?.status === "verified") {
    revalidateTag(
      participantByReferenceTag({
        domain: participant.domain,
        reference: participant.reference,
      })
    );
    revalidateTag(participantsByDomainTag({ domain: participant.domain }));
  }

  return Response.json({ isVerified: participant?.status === "verified" });
}
