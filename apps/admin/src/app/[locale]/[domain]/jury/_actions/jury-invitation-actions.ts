"use server";

import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { createJuryInvitation } from "@vimmer/supabase/mutations";
import { SignJWT } from "jose";

const DEFAULT_EXPIRY_DAYS = 14;
const MAX_EXPIRY_DAYS = 90;

// Define the schema for jury invitation creation
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
  marathonId: number,
  competitionClassId: number | null,
  deviceGroupId: number | null,
  topicId: number | null
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * MAX_EXPIRY_DAYS; // 90 days max expiry

  const payload = {
    marathonId,
    filters: {
      competitionClassId,
      deviceGroupId,
      topicId,
    },
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

    if (!domain) {
      throw new Error("No domain found");
    }

    const marathon = await getMarathonByDomain(domain);

    if (!marathon) {
      throw new Error("Marathon not found");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parsedInput.expiryDays);

    // Generate the secure token
    const token = await generateJuryToken(
      marathon.id,
      parsedInput.competitionClassId ?? null,
      parsedInput.deviceGroupId ?? null,
      parsedInput.topicId ?? null
    );

    const displayName = parsedInput.email.split("@")[0] || parsedInput.email;

    const supabase = await createClient();
    const createdInvitation = await createJuryInvitation(supabase, {
      marathonId: marathon.id,
      email: parsedInput.email,
      displayName: displayName,
      token,
      expiresAt: expiresAt.toISOString(),
      status: "pending",
      competitionClassId: parsedInput.competitionClassId ?? null,
      deviceGroupId: parsedInput.deviceGroupId ?? null,
      topicId: parsedInput.topicId ?? null,
    });

    revalidateTag(`jury-invitations-${domain}`);
    revalidatePath(`/${domain}/jury`);

    return createdInvitation;
  });
