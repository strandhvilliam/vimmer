"use server";

import { resend } from "@/lib/resend";
import { actionClient } from "@/actions/safe-action";
import { StaffInviteEmail } from "@vimmer/email";
import { z } from "zod";

export const sendStaffInviteEmail = actionClient
  .schema(
    z.object({
      name: z.string(),
      email: z.string().email(),
      marathonName: z.string(),
      inviterName: z.string(),
      domain: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { name, email, marathonName, inviterName, domain },
    }) => {
      const { error } = await resend.emails.send({
        from: "Blikka Support <support@vimmer.photo>",
        to: email,
        subject: `You've been added as staff to ${marathonName}`,
        react: StaffInviteEmail({
          staffName: name,
          contestName: marathonName,
          inviterName: inviterName,
          loginUrl: `https://${domain}.blikka.app/staff`,
          supportEmail: "support@vimmer.photo",
        }),
      });

      if (error) {
        throw new Error("Failed to send email");
      }
    },
  );
