"use server";

import { actionClient, ActionError } from "@/lib/safe-action";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { createClient } from "@vimmer/supabase/server";
import { deleteUserMarathonRelation } from "@vimmer/supabase/mutations";
import { revalidateTag } from "next/cache";
import {
  staffMemberByIdTag,
  staffMembersByDomainTag,
} from "@vimmer/supabase/cache-tags";

const removeStaffMemberSchema = z.object({
  staffId: z.string(),
});

export const removeStaffMemberAction = actionClient
  .schema(removeStaffMemberSchema)
  .action(async ({ parsedInput: { staffId } }) => {
    const session = await getSession();
    if (!session) {
      throw new ActionError("No session found");
    }

    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;
    if (!domain) {
      throw new ActionError("No domain found");
    }

    const marathon = await getMarathonByDomain(domain);
    if (!marathon) {
      throw new ActionError("Marathon not found");
    }

    const supabase = await createClient();

    // Remove user marathon relation
    await deleteUserMarathonRelation(supabase, staffId, marathon.id);

    // Revalidate cache
    revalidateTag(staffMemberByIdTag({ staffId }));
    revalidateTag(staffMembersByDomainTag({ domain }));

    return { success: true };
  });
