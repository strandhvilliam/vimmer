"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { actionClient } from "@/lib/actions/safe-action";
import { z } from "zod";
import {
  participantVerificationsByStaffIdTag,
  staffMemberByIdTag,
} from "@vimmer/supabase/cache-tags";

const refreshStaffDataSchema = z.object({
  staffId: z.string(),
  marathonId: z.number(),
});

export const refreshStaffData = actionClient
  .schema(refreshStaffDataSchema)
  .action(async ({ parsedInput: { staffId, marathonId } }) => {
    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;

    if (!domain) {
      throw new Error("Domain not found");
    }

    revalidateTag(staffMemberByIdTag({ staffId, marathonId }));
    revalidateTag(participantVerificationsByStaffIdTag({ staffId }));

    return {
      refreshedAt: new Date().toISOString(),
      success: true,
    };
  });
