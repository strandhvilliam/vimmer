"use client";
import { DeviceGroup } from "@vimmer/supabase/types";
import { Camera, Tablet, Smartphone, XIcon, Loader2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import React, { useState } from "react";
import { Card } from "@vimmer/ui/components/card";
import { useAction } from "next-safe-action/hooks";
import { deleteDeviceGroupAction } from "../actions/device-group-delete-action";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@vimmer/ui/components/alert-dialog";

interface DeviceGroupsListProps {
  groups: DeviceGroup[];
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

export function DeviceGroupsList({ groups }: DeviceGroupsListProps) {
  const { execute: deleteDeviceGroup, isExecuting: isDeletingDeviceGroup } =
    useAction(deleteDeviceGroupAction, {
      onSuccess: () => {
        toast.success("Device group deleted");
      },
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {groups.map((group) => (
        <DeviceGroupCard
          key={group.id}
          group={group}
          onDelete={() => deleteDeviceGroup({ id: group.id })}
          isDeleting={isDeletingDeviceGroup}
        />
      ))}
    </div>
  );
}

function DeviceGroupCard({
  group,
  onDelete,
  isDeleting,
}: {
  group: DeviceGroup;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card key={group.id} className="relative">
      <div className="flex flex-col gap-2 p-4">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <Button
            variant="ghost"
            className="absolute top-2 right-2 p-0 hover:bg-transparent"
            size="icon"
            disabled={isDeleting}
            onClick={() => setIsOpen(true)}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XIcon className="w-4 h-4" />
            )}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
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
        <div className="flex h-fit items-center w-fit justify-between bg-muted rounded-lg shadow-sm border p-2">
          {getDeviceIcon(group.icon)}
        </div>
        <div className="flex flex-col tems-center justify-between">
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <p className="text-sm text-muted-foreground">{group.description}</p>
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
  );
}
