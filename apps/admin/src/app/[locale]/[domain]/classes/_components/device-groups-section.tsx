import { getDeviceGroupsByDomain } from "@vimmer/supabase/cached-queries";
import { DeviceGroupCreateDialog } from "./device-group-create-dialog";
import { DeviceGroupsList } from "./device-groups-list";

export async function DeviceGroupsSection({ domain }: { domain: string }) {
  const groups = await getDeviceGroupsByDomain(domain);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Device Groups</h2>
      </div>
      <p className="text-sm text-muted-foreground pb-4">
        Here you can manage the device groups that are available for the
        marathon. This is mostly to categorise the devices for the participants.
      </p>
      <DeviceGroupsList groups={groups} />
    </section>
  );
}
