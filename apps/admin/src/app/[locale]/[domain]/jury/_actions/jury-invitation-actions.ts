"use server";

import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import {
  createJuryInvitation,
  deleteJuryInvitation,
} from "@vimmer/supabase/mutations";
import { SignJWT } from "jose";
import { resend } from "@/lib/resend";
import { JuryReviewEmail } from "@vimmer/email";
import { getTopicByIdQuery } from "@vimmer/supabase/queries";
import { getCompetitionClassByIdQuery } from "@vimmer/supabase/queries";
import { juryInvitationsByDomainTag } from "@vimmer/supabase/cache-tags";

const MAX_EXPIRY_DAYS = 90;
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

const createJuryInvitationSchema = z.object({
  displayName: z.string(),
  email: z.string().email({ message: "Invalid email address." }),
  notes: z.string().optional(),
  competitionClassId: z.number().nullable().optional(),
  deviceGroupId: z.number().nullable().optional(),
  topicId: z.number().nullable().optional(),
  expiryDays: z.number().min(1).max(90).default(14),
});

export type CreateJuryInvitationInput = z.infer<
  typeof createJuryInvitationSchema
>;

async function generateJuryToken(
  domain: string,
  invitationId: number
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * MAX_EXPIRY_DAYS; // 90 days max expiry

  const payload = {
    domain,
    invitationId,
    iat,
    exp,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

export const createJuryInvitationAction = actionClient
  .schema(createJuryInvitationSchema)
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? `${CLIENT_URL}`
        : `${domain}/${CLIENT_URL}`;

    if (!domain) {
      throw new Error("No domain found");
    }

    const marathon = await getMarathonByDomain(domain);

    if (!marathon) {
      throw new Error("Marathon not found");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parsedInput.expiryDays);

    const supabase = await createClient();
    const displayName = parsedInput.displayName;

    const createdInvitation = await createJuryInvitation(supabase, {
      marathonId: marathon.id,
      email: parsedInput.email,
      displayName: displayName,
      token: "", // Will be updated after token generation
      expiresAt: expiresAt.toISOString(),
      status: "pending",
      competitionClassId: parsedInput.competitionClassId ?? null,
      deviceGroupId: parsedInput.deviceGroupId ?? null,
      topicId: parsedInput.topicId ?? null,
    });

    // Generate token with invitation ID
    const token = await generateJuryToken(domain, createdInvitation.id);

    // Update invitation with the generated token
    const { error: updateError } = await supabase
      .from("jury_invitations")
      .update({ token })
      .eq("id", createdInvitation.id);

    if (updateError) {
      throw new Error("Failed to update invitation with token");
    }

    const competitionClass = parsedInput.competitionClassId
      ? await getCompetitionClassByIdQuery(
          supabase,
          parsedInput.competitionClassId
        )
      : null;
    const topic = parsedInput.topicId
      ? await getTopicByIdQuery(supabase, parsedInput.topicId)
      : null;

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [parsedInput.email],
      subject: `Invitation to review ${marathon.name} submissions`,
      react: JuryReviewEmail({
        juryName: displayName,
        competitionName: marathon.name,
        reviewDeadline: expiresAt.toISOString(),
        reviewUrl: `${baseUrl}/jury?token=${token}`,
        description: "",
        specificTopic: topic?.name ?? "",
        competitionGroup: competitionClass?.name ?? "",
      }),
    });

    revalidateTag(juryInvitationsByDomainTag({ domain }));
    revalidatePath(`/${domain}/jury`);

    return { ...createdInvitation, token };
  });

const deleteJuryInvitationSchema = z.object({
  invitationId: z.number(),
});

export type DeleteJuryInvitationInput = z.infer<
  typeof deleteJuryInvitationSchema
>;

export const deleteJuryInvitationAction = actionClient
  .schema(deleteJuryInvitationSchema)
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;

    if (!domain) {
      throw new Error("No domain found");
    }

    const supabase = await createClient();

    await deleteJuryInvitation(supabase, parsedInput.invitationId);

    revalidateTag(juryInvitationsByDomainTag({ domain }));
    revalidatePath(`/${domain}/jury`);

    return { success: true };
  });
