"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import {
  participantVerificationsByStaffIdTag,
  staffMemberByIdTag,
} from "@vimmer/supabase/cache-tags";

const refreshStaffDataSchema = z.object({
  staffId: z.string(),
});

export const refreshStaffData = actionClient
  .schema(refreshStaffDataSchema)
  .action(async ({ parsedInput: { staffId } }) => {
    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;
    const locale = cookieStore.get("Next-Locale")?.value;

    console.log({ domain, locale });

    if (!domain) {
      throw new Error("Domain not found");
    }

    revalidateTag(staffMemberByIdTag({ staffId }));
    revalidateTag(participantVerificationsByStaffIdTag({ staffId }));

    return {
      refreshedAt: new Date().toISOString(),
      success: true,
    };
  });
