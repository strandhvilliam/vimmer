"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@vimmer/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { updateMarathonByDomain } from "@vimmer/supabase/mutations";
import { InsertMarathon } from "@vimmer/supabase/types";
import {
  updateMarathonSettingsSchema,
  UpdateSettingsInput,
} from "@/lib/schemas";

export const updateMarathonSettingsAction = actionClient
  .schema(updateMarathonSettingsSchema)
  .action(async ({ parsedInput }: { parsedInput: UpdateSettingsInput }) => {
    const { domain, ...settings } = parsedInput;
    const supabase = await createClient();

    const updateData: Partial<InsertMarathon> = {
      name: settings.name,
      startDate: settings.startDate
        ? settings.startDate.toISOString()
        : undefined,
      endDate: settings.endDate ? settings.endDate.toISOString() : undefined,
      description: settings.description,
      logoUrl: settings.logoUrl,
      languages: settings.languages ? settings.languages.join(",") : undefined,
    };

    const updatedMarathon = await updateMarathonByDomain(
      supabase,
      domain,
      updateData
    );

    revalidateTag(`marathon-${domain}`);

    return updatedMarathon;
  });
