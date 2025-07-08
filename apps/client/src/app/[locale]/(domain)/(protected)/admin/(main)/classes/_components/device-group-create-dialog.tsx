"use client";

import { Button } from "@vimmer/ui/components/button";
import { Camera, Check, Loader2, Plus, Smartphone, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import { useState } from "react";
import { Input } from "@vimmer/ui/components/input";
import { cn } from "@vimmer/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Card } from "@vimmer/ui/components/card";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { useForm } from "@tanstack/react-form";
import { Label } from "@vimmer/ui/components/label";

const deviceIcons = [
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

export function DeviceGroupCreateDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain })
  );

  const { mutate: createDeviceGroup, isPending: isCreatingDeviceGroup } =
    useMutation(
      trpc.deviceGroups.create.mutationOptions({
        onSuccess: () => {
          setIsOpen(false);
          toast.success("Device group created successfully");
          form.reset();
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
      name: "",
      description: "",
      icon: "camera" as "camera" | "smartphone" | "action-camera",
    },
    onSubmit: async ({ value }) => {
      if (!marathon?.id) {
        toast.error("Marathon not found");
        return;
      }

      createDeviceGroup({
        data: {
          name: value.name,
          description: value.description,
          icon: value.icon,
          marathonId: marathon.id,
        },
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="flex items-center justify-center bg-muted/50">
          <Button
            variant="ghost"
            className="w-full transition duration-200 h-full flex flex-col items-center justify-center py-10 text-muted-foreground"
          >
            <Plus className="h-8 w-8" />
            <span>Add Device Group</span>
          </Button>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device Group</DialogTitle>
          <DialogDescription>
            Create a new device group. This will be available for participants
            to categorize their devices.
          </DialogDescription>
        </DialogHeader>
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
              onChange: ({ value }) =>
                !value ? "Device group name is required" : undefined,
            }}
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Professional Cameras"
                />
                <p className="text-sm text-muted-foreground">
                  The name of the device group.
                </p>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
              </div>
            )}
          />

          <form.Field
            name="description"
            validators={{
              onChange: ({ value }) =>
                !value ? "Description is required" : undefined,
            }}
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="DSLR and Mirrorless cameras"
                />
                <p className="text-sm text-muted-foreground">
                  A brief description of the device group.
                </p>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
              </div>
            )}
          />

          <form.Field
            name="icon"
            children={(field) => (
              <div className="space-y-2">
                <Label>Device Icon</Label>
                <div className="flex gap-3">
                  {deviceIcons.map((type) => (
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
                <p className="text-sm text-muted-foreground">
                  Select the icon for the device group.
                </p>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
              </div>
            )}
          />

          <div className="flex justify-end gap-3">
            <PrimaryButton
              type="submit"
              disabled={isCreatingDeviceGroup}
              className="min-w-24"
            >
              {isCreatingDeviceGroup ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
