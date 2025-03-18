import { Button } from "@vimmer/ui/components/button";
import { Card } from "@vimmer/ui/components/card";
import { Camera, Smartphone, Tablet, XIcon } from "lucide-react";
import { AddDeviceGroupDialog } from "./components/add-device-group-dialog";

interface DeviceGroup {
  id: number;
  name: string;
  description: string;
  icon: string;
}

function getDeviceIcon(icon: string) {
  switch (icon) {
    case "smartphone":
      return <Smartphone className="h-6 w-6" />;
    case "tablet":
      return <Tablet className="h-6 w-6" />;
    case "camera":
    default:
      return <Camera className="h-6 w-6" />;
  }
}

async function getDeviceGroups(): Promise<DeviceGroup[]> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return [
    {
      id: 1,
      name: "Professional Cameras",
      description: "DSLR and Mirrorless cameras",
      icon: "camera",
    },
    {
      id: 2,
      name: "Mobile Devices",
      description: "Smartphones and tablets",
      icon: "smartphone",
    },
  ];
}

export async function DeviceGroupsSection() {
  const groups = await getDeviceGroups();

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Device Groups</h2>
        <AddDeviceGroupDialog
          onAddGroup={async (data) => {
            "use server";
            // Here you would make an API call to create the group
            // and then revalidate the page data
            console.log("Adding group:", data);
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground pb-4">
        Here you can manage the device groups that are available for the
        marathon. This is mostly to categorise the devices for the participants.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="relative">
            <div className="flex flex-col gap-2 p-4">
              <Button
                variant="ghost"
                className="absolute top-2 right-2 p-0 hover:bg-transparent"
                size="icon"
              >
                <XIcon className="w-4 h-4" />
              </Button>
              <div className="flex h-fit items-center w-fit justify-between bg-muted rounded-lg shadow-sm border p-2">
                {getDeviceIcon(group.icon)}
              </div>
              <div className="flex flex-col tems-center justify-between">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
            </div>
            <div className="flex items-center px-4 pb-4 gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View Submissions
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
