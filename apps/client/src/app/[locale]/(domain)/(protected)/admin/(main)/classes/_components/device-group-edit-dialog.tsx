"use client";

import { Button } from "@vimmer/ui/components/button";
import { Camera, Check, Loader2, Smartphone, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { Suspense } from "react";
import { Input } from "@vimmer/ui/components/input";
import { cn } from "@vimmer/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { editDeviceGroupSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";

const deviceTypes = [
  {
    value: "camera",
    icon: Camera,
  },
  {
    value: "smartphone",
    icon: Smartphone,
  },
  {
    value: "action-camera",
    icon: Zap,
  },
] as const;

interface DeviceGroupEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deviceGroupId: number | null;
}

function DeviceGroupEditForm({
  deviceGroupId,
  onSuccess,
}: {
  deviceGroupId: number;
  onSuccess: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: deviceGroup } = useSuspenseQuery(
    trpc.deviceGroups.getById.queryOptions({ id: deviceGroupId })
  );

  const { mutate: editDeviceGroup, isPending } = useMutation(
    trpc.deviceGroups.update.mutationOptions({
      onSuccess: () => {
        onSuccess();
        toast.success("Device group updated successfully");
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

  const form = useForm({
    defaultValues: {
      id: deviceGroup?.id,
      name: deviceGroup?.name || "",
      description: deviceGroup?.description || "",
      icon: deviceGroup?.icon || "camera",
    },
    onSubmit: async ({ value }) => {
      if (!value.id) {
        return;
      }

      editDeviceGroup({
        id: value.id,
        data: {
          name: value.name,
          description: value.description,
          icon: value.icon,
        },
      });
    },
  });

  if (!deviceGroup) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Device group not found</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            const result = editDeviceGroupSchema.shape.name.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Name
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Professional Cameras"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              The name of the device group.
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{
          onChange: ({ value }) => {
            const result =
              editDeviceGroupSchema.shape.description.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="DSLR and Mirrorless cameras"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              A brief description of the device group.
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="icon"
        validators={{
          onChange: ({ value }) => {
            const result = editDeviceGroupSchema.shape.icon.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Device Type
            </label>
            <div className="flex gap-3 mt-2">
              {deviceTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex-1 h-fit aspect-square p-0 relative overflow-hidden",
                    field.state.value === type.value &&
                      "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => field.handleChange(type.value)}
                >
                  <motion.div
                    animate={{
                      scale: field.state.value === type.value ? 1.1 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <type.icon className="h-12 w-12" />
                  </motion.div>
                  <AnimatePresence>
                    {field.state.value === type.value && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-1 right-1 bg-primary rounded-full p-0.5"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Select the type of devices in this group.
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-3">
        <PrimaryButton type="submit" disabled={isPending} className="min-w-24">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </PrimaryButton>
      </div>
    </form>
  );
}

export function DeviceGroupEditDialog({
  isOpen,
  onOpenChange,
  deviceGroupId,
}: DeviceGroupEditDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device Group</DialogTitle>
          <DialogDescription>
            Modify the device group details. These changes will be reflected
            immediately.
          </DialogDescription>
        </DialogHeader>
        {deviceGroupId && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
          >
            <DeviceGroupEditForm
              deviceGroupId={deviceGroupId}
              onSuccess={handleClose}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}
