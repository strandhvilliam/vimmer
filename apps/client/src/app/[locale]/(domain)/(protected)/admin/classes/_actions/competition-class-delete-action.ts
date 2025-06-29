"use server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { createClient } from "@vimmer/supabase/server";
import { deleteCompetitionClass } from "@vimmer/supabase/mutations";

const deleteCompetitionClassSchema = z.object({
  id: z.number(),
});

export type DeleteCompetitionClassInput = z.infer<
  typeof deleteCompetitionClassSchema
>;

export const deleteCompetitionClassAction = actionClient
  .schema(deleteCompetitionClassSchema)
  .action(async ({ parsedInput: { id } }) => {
    const domain = (await cookies()).get("activeDomain")?.value;
    if (!domain) {
      throw new Error("No domain found");
    }
    const supabase = await createClient();

    await deleteCompetitionClass(supabase, id);

    revalidateTag(`competition-classes-${domain}`);
  });
