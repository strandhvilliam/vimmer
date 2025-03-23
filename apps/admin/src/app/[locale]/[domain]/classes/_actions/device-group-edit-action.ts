"use server";
import { createClient } from "@vimmer/supabase/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { updateDeviceGroup } from "@vimmer/supabase/mutations";
import { actionClient } from "@/lib/safe-action";

const editDeviceGroupSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export type EditDeviceGroupInput = z.infer<typeof editDeviceGroupSchema>;

export const editDeviceGroupAction = actionClient
  .schema(editDeviceGroupSchema)
  .action(async ({ parsedInput: { id, name, description, icon } }) => {
    const domain = (await cookies()).get("activeDomain")?.value;
    if (!domain) {
      throw new Error("No domain found");
    }
    const supabase = await createClient();

    const updatedDeviceGroup = await updateDeviceGroup(supabase, id, {
      name,
      description,
      icon,
    });

    revalidateTag(`device-groups-${domain}`);
    return updatedDeviceGroup;
  });
