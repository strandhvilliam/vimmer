"use server";

import { actionClient } from "@/actions/safe-action";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { JuryReviewEmail } from "@vimmer/email";

const sendInvitationEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  token: z.string(),
  domain: z.string(),
  invitationId: z.number(),
  marathonName: z.string(),
  competitionClass: z.string(),
  topic: z.string(),
  expiresAt: z.date(),
  displayName: z.string(),
});

export type SendInvitationEmailInput = z.infer<
  typeof sendInvitationEmailSchema
>;

export const sendInvitationEmailAction = actionClient
  .schema(sendInvitationEmailSchema)
  .action(async ({ parsedInput }) => {
    const getClientUrl = (domain: string) => {
      if (process.env.NODE_ENV === "development") {
        return `http://${domain}.localhost:3000`;
      }
      return `https://${domain}.vimmer.photo`;
    };

    const { data, error } = await resend.emails.send({
      from: "Vimmer Support <support@vimmer.photo>",
      to: [parsedInput.email],
      subject: `Invitation to review ${parsedInput.marathonName} submissions`,
      react: JuryReviewEmail({
        juryName: parsedInput.displayName,
        competitionName: parsedInput.marathonName,
        reviewDeadline: parsedInput.expiresAt.toISOString(),
        reviewUrl: `${getClientUrl(parsedInput.domain)}/jury?token=${parsedInput.token}`,
        description: "",
        specificTopic: parsedInput.topic,
        competitionGroup: parsedInput.competitionClass,
      }),
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);

    return { success: true };
  });
