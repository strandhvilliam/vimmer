"use server";

import { actionClient, ActionError } from "@/lib/actions/safe-action";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { createClient } from "@vimmer/supabase/server";
import { updateUserMarathonRelation } from "@vimmer/supabase/mutations";
import { revalidateTag } from "next/cache";
import {
  staffMemberByIdTag,
  staffMembersByDomainTag,
} from "@vimmer/supabase/cache-tags";

const updateStaffMemberSchema = z.object({
  staffId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["staff", "admin"]),
});

export const updateStaffMemberAction = actionClient
  .schema(updateStaffMemberSchema)
  .action(async ({ parsedInput: { staffId, name, email, role } }) => {
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

    // Update user information
    const { error: userError } = await supabase
      .from("user")
      .update({ name, email })
      .eq("id", staffId);

    if (userError) {
      throw new ActionError("Failed to update user information");
    }

    // Update user marathon relation (role)
    await updateUserMarathonRelation(supabase, staffId, marathon.id, { role });

    // Revalidate cache
    revalidateTag(staffMemberByIdTag({ staffId, marathonId: marathon.id }));
    revalidateTag(staffMembersByDomainTag({ domain }));

    return { success: true };
  });
