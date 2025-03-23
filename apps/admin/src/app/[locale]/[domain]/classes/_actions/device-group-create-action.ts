"use server";
import { createClient } from "@vimmer/supabase/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { createDeviceGroup } from "@vimmer/supabase/mutations";
import { actionClient } from "@/lib/safe-action";
import { createDeviceGroupSchema } from "@/lib/schemas";

export const createDeviceGroupAction = actionClient
  .schema(createDeviceGroupSchema)
  .action(async ({ parsedInput: { name, description, icon } }) => {
    const domain = (await cookies()).get("activeDomain")?.value;
    if (!domain) {
      throw new Error("No domain found");
    }
    const supabase = await createClient();

    const marathon = await getMarathonByDomain(domain);
    if (!marathon) {
      throw new Error("Marathon not found");
    }

    const createdDeviceGroup = await createDeviceGroup(supabase, {
      marathonId: marathon.id,
      name,
      description,
      icon,
    });

    revalidateTag(`device-groups-${domain}`);
    return createdDeviceGroup;
  });
