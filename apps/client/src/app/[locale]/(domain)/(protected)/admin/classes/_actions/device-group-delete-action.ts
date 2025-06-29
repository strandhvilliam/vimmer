"use server";
import { createClient } from "@vimmer/supabase/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import {
  deleteDeviceGroup,
  updateDeviceGroup,
} from "@vimmer/supabase/mutations";
import { actionClient } from "@/lib/safe-action";

const deleteDeviceGroupSchema = z.object({
  id: z.number(),
});

export type DeleteDeviceGroupInput = z.infer<typeof deleteDeviceGroupSchema>;

export const deleteDeviceGroupAction = actionClient
  .schema(deleteDeviceGroupSchema)
  .action(async ({ parsedInput: { id } }) => {
    const domain = (await cookies()).get("activeDomain")?.value;
    if (!domain) {
      throw new Error("No domain found");
    }
    const supabase = await createClient();

    await deleteDeviceGroup(supabase, id);

    revalidateTag(`device-groups-${domain}`);
  });
