"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Camera,
  Check,
  Loader2,
  Smartphone,
  SwitchCamera,
  Tablet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import { useState } from "react";
import { Form } from "@vimmer/ui/components/form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@vimmer/ui/components/input";
import { cn } from "@vimmer/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAction } from "next-safe-action/hooks";
import { EditDeviceGroupInput, editDeviceGroupSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { DeviceGroup } from "@vimmer/supabase/types";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { editDeviceGroupAction } from "../_actions/device-group-edit-action";
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
    value: "tablet",
    icon: Tablet,
  },
  {
    value: "analogue",
    icon: SwitchCamera,
  },
] as const;

interface DeviceGroupEditDialogProps {
  group: DeviceGroup;
  trigger?: React.ReactNode;
}

export function DeviceGroupEditDialog({
  group,
  trigger,
}: DeviceGroupEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { execute: editDeviceGroup, isExecuting: isEditingDeviceGroup } =
    useAction(editDeviceGroupAction, {
      onSuccess: () => {
        setIsOpen(false);
        toast.success("Device group updated successfully");
      },
      onError: (error) => {
        toast.error(
          (error.error.serverError as string) || "Something went wrong"
        );
      },
    });

  const form = useForm<EditDeviceGroupInput>({
    resolver: zodResolver(editDeviceGroupSchema),
    defaultValues: {
      id: group.id,
      name: group.name || "",
      description: group.description || "",
      icon: group.icon || "camera",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device Group</DialogTitle>
          <DialogDescription>
            Modify the device group details. These changes will be reflected
            immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(editDeviceGroup)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Professional Cameras" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the device group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DSLR and Mirrorless cameras"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the device group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      {deviceTypes.map((type) => (
                        <Button
                          key={type.value}
                          type="button"
                          variant="outline"
                          className={cn(
                            "flex-1 h-fit aspect-square p-0 relative overflow-hidden",
                            field.value === type.value &&
                              "ring-2 ring-primary ring-offset-2"
                          )}
                          onClick={() => field.onChange(type.value)}
                        >
                          <motion.div
                            animate={{
                              scale: field.value === type.value ? 1.1 : 1,
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
                            {field.value === type.value && (
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
                  </FormControl>
                  <FormDescription>
                    Select the type of devices in this group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <PrimaryButton
                type="submit"
                disabled={isEditingDeviceGroup}
                className="min-w-24"
              >
                {isEditingDeviceGroup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </PrimaryButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
