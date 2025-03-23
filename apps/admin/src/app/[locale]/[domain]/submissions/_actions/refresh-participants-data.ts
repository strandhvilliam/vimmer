"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { actionClient } from "@/lib/safe-action";

export const refreshParticipantsData = actionClient.action(async () => {
  const cookieStore = await cookies();
  const domain = cookieStore.get("activeDomain")?.value;
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  if (!domain) {
    throw new Error("Domain not found");
  }
  revalidateTag(`participants-${domain}`);
  revalidatePath(`/${locale}/${domain}/submissions`);

  return {
    refreshedAt: new Date().toISOString(),
    success: true,
  };
});
