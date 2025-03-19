"use server";
import { createClient } from "@vimmer/supabase/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { editCompetitionClassSchema } from "@/lib/schemas";
import { updateCompetitionClass } from "@vimmer/supabase/mutations";

export const editCompetitionClassAction = actionClient
  .schema(editCompetitionClassSchema)
  .action(
    async ({ parsedInput: { id, name, description, numberOfPhotos } }) => {
      const domain = (await cookies()).get("activeDomain")?.value;
      if (!domain) {
        throw new Error("No domain found");
      }
      const supabase = await createClient();
      const updatedCompetitionClass = await updateCompetitionClass(
        supabase,
        id,
        {
          name,
          description,
          numberOfPhotos,
        }
      );
      revalidateTag(`competition-classes-${domain}`);
      return updatedCompetitionClass;
    }
  );
