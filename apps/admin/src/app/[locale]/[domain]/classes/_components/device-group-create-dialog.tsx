"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Camera,
  Check,
  Loader2,
  Plus,
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
import { z } from "zod";
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
import { CreateDeviceGroupInput, createDeviceGroupSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Card } from "@vimmer/ui/components/card";
import { createDeviceGroupAction } from "../_actions/device-group-create-action";

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
    value: "analogue",
    icon: SwitchCamera,
  },
] as const;

export function DeviceGroupCreateDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const { execute: createDeviceGroup, isExecuting: isCreatingDeviceGroup } =
    useAction(createDeviceGroupAction, {
      onSuccess: () => {
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Something went wrong");
      },
    });

  const form = useForm<CreateDeviceGroupInput>({
    resolver: zodResolver(createDeviceGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "camera",
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(createDeviceGroup)}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
