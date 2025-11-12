"use server"

import { actionClient } from "@/actions/safe-action"
import { z } from "zod"
import { resend } from "@/lib/resend"
import { JuryReviewEmail } from "../../../../packages/email/src/jury-invitation-email"

const sendInvitationEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  token: z.string(),
  domain: z.string(),
  invitationId: z.number(),
  marathonName: z.string(),
  competitionClass: z.string().optional(),
  topic: z.string().optional(),
  expiresAt: z.date(),
  displayName: z.string(),
  inviteType: z.enum(["topic", "class"]).optional(),
})

export type SendInvitationEmailInput = z.infer<typeof sendInvitationEmailSchema>

export const sendInvitationEmailAction = actionClient
  .schema(sendInvitationEmailSchema)
  .action(async ({ parsedInput }) => {
    console.log("Sending invitation email to", parsedInput.email)
    const getClientUrl = (domain: string) => {
      if (process.env.NODE_ENV === "development") {
        return `http://${domain}.localhost:3000`
      }
      return `https://${domain}.blikka.app`
    }

    // Generate appropriate description based on invite type
    let description = ""
    if (parsedInput.inviteType === "topic") {
      description =
        "You have been invited to judge the topic competition. Please review all submissions for the specified topic and select the best picture that represents the topic."
    } else if (parsedInput.inviteType === "class") {
      description =
        "You have been invited to judge the class series competition. Please review participants' submissions as a 'series' and compare between different participants' series to determine the best series of photos in this class."
    }

    const { error } = await resend.emails.send({
      from: "Blikka App <support@blikka.app>",
      to: [parsedInput.email],
      subject: `Invitation to review ${parsedInput.marathonName} submissions`,
      react: JuryReviewEmail({
        juryName: parsedInput.displayName,
        competitionName: parsedInput.marathonName,
        reviewDeadline: parsedInput.expiresAt.toISOString(),
        reviewUrl: `${getClientUrl(parsedInput.domain)}/jury?token=${parsedInput.token}`,
        description,
        specificTopic: parsedInput.topic || "",
        competitionGroup: parsedInput.competitionClass || "",
      }),
    })

    if (error) {
      console.error("Error sending invitation email", error)
      throw new Error(error.message)
    }

    return { success: true }
  })
