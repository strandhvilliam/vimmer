"use server";
import { createClient } from "@vimmer/supabase/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createCompetitionClassSchema } from "@/lib/schemas";
import { createCompetitionClass } from "@vimmer/supabase/mutations";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";

export const createCompetitionClassAction = actionClient
  .schema(createCompetitionClassSchema)
  .action(async ({ parsedInput: { name, description, numberOfPhotos } }) => {
    const domain = (await cookies()).get("activeDomain")?.value;
    if (!domain) {
      throw new Error("No domain found");
    }
    const marathon = await getMarathonByDomain(domain);
    if (!marathon) {
      throw new Error("Marathon not found");
    }
    const supabase = await createClient();
    const createdCompetitionClass = await createCompetitionClass(supabase, {
      name,
      description,
      numberOfPhotos,
      marathonId: marathon.id,
    });
    revalidateTag(`competition-classes-${domain}`);
    return createdCompetitionClass;
  });
