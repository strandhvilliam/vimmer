"use server";

import { auth, getSession } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { actionClient, ActionError } from "@/lib/actions/safe-action";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import {
  createUser,
  createUserMarathonRelation,
} from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";
import { cookies } from "next/headers";
import { StaffInviteEmail } from "@vimmer/email";
import { addStaffMemberSchema } from "../_utils/staff-schemas";
import { authClient } from "@/lib/auth-client";
import { getUserByEmailWithMarathonsQuery } from "@vimmer/supabase/queries";

const TEMP_MASTER_PW = "master-pw";

export const addStaffMemberAction = actionClient
  .schema(addStaffMemberSchema)
  .action(async ({ parsedInput: { name, email, role } }) => {
    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;

    const session = await getSession();

    if (!session) {
      throw new ActionError("No session found");
    }

    const { user: adminUser } = session;

    if (!domain) {
      throw new ActionError("No domain found");
    }
    const marathon = await getMarathonByDomain(domain);
    if (!marathon) {
      throw new ActionError("Marathon not found");
    }

    const supabase = await createClient();
    let user = await getUserByEmailWithMarathonsQuery(supabase, email);

    if (user && user.userMarathons.some((m) => m.marathonId === marathon.id)) {
      throw new ActionError("User already has access to this marathon");
    }

    if (!user) {
      const newUser = await createUser(supabase, {
        email,
        name,
      });

      user = { ...newUser, userMarathons: [] };
    }

    await createUserMarathonRelation(supabase, {
      userId: user.id,
      role,
      marathonId: marathon.id,
    });

    const response = await resend.emails.send({
      from: "Vimmer Support <support@vimmer.photo>",
      to: email,
      subject: `You've been added as staff to ${marathon.name}`,
      react: StaffInviteEmail({
        staffName: name,
        contestName: marathon.name,
        inviterName: adminUser.name,
        loginUrl: `https://${domain}.vimmer.photo/staff`,
        supportEmail: "support@vimmer.photo",
      }),
    });

    console.log(response);
  });
