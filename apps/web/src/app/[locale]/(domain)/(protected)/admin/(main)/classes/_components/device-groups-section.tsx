"use client";

import { useDomain } from "@/contexts/domain-context";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { DeviceGroupCreateDialog } from "./device-group-create-dialog";
import { DeviceGroupEditDialog } from "./device-group-edit-dialog";
import { parseAsInteger, useQueryState } from "nuqs";
import { DeviceGroup } from "@vimmer/api/db/types";
import { Button } from "@vimmer/ui/components/button";
import { Card } from "@vimmer/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vimmer/ui/components/alert-dialog";
import { Camera, Smartphone, XIcon, Zap, Trash2 } from "lucide-react";
import { useState } from "react";

function getDeviceIcon(icon: string) {
  switch (icon) {
    case "smartphone":
      return <Smartphone className="h-6 w-6" />;
    case "action-camera":
      return <Zap className="h-6 w-6" />;
    default:
      return <Camera className="h-6 w-6" />;
  }
}

export function DeviceGroupsSection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();
  const [editDeviceGroupId, setEditDeviceGroupId] = useQueryState(
    "editDeviceGroupId",
    parseAsInteger
  );

  const { data: groups } = useSuspenseQuery(
    trpc.deviceGroups.getByDomain.queryOptions({ domain })
  );

  const { mutate: deleteDeviceGroup, isPending: isDeleting } = useMutation(
    trpc.deviceGroups.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Device group deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.deviceGroups.pathKey(),
        });
      },
    })
  );

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold font-rocgrotesk">
          Device Groups
        </h2>
      </div>
      <p className="text-sm text-muted-foreground pb-4">
        Here you can add, edit, or remove device groups for the marathon. Each
        group helps you organize participants by the type of camera or device
        they use. Use this section to create categories like smartphones, action
        cameras, or other devices for your event.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {groups.map((group) => (
          <DeviceGroupCard
            key={group.id}
            group={group}
            onDelete={() => deleteDeviceGroup({ id: group.id })}
            onOpenEdit={() => setEditDeviceGroupId(group.id)}
            isDeleting={isDeleting}
          />
        ))}
        <DeviceGroupCreateDialog />
        <DeviceGroupEditDialog
          deviceGroupId={editDeviceGroupId}
          isOpen={!!editDeviceGroupId}
          onOpenChange={() => setEditDeviceGroupId(null)}
        />
      </div>
    </section>
  );
}

function DeviceGroupCard({
  group,
  onDelete,
  isDeleting,
  onOpenEdit,
}: {
  group: DeviceGroup;
  onDelete: () => void;
  isDeleting: boolean;
  onOpenEdit: () => void;
}) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const renderAlertDialog = () => {
    return (
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete()}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <Card key={group.id} className="relative justify-between flex flex-col">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex h-fit items-center w-fit justify-center bg-muted rounded-lg shadow-sm border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center justify-center">
                {getDeviceIcon(group.icon)}
              </span>
            </TooltipTrigger>
            <TooltipContent>Device type: {group.icon}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col tems-center justify-between">
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
      </div>
      <div className="flex items-center px-4 pb-4 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={onOpenEdit}
        >
          Edit
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsAlertOpen(true)}
          aria-label="Delete device group"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        {renderAlertDialog()}
      </div>
    </Card>
  );
}
