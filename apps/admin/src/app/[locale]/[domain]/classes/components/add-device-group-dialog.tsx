"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Camera,
  Check,
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

interface AddDeviceGroupDialogProps {
  onAddGroup: (data: {
    name: string;
    description: string;
    icon: string;
  }) => void;
}

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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  icon: z.enum(["camera", "smartphone", "tablet"] as const, {
    required_error: "Please select a device type.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function AddDeviceGroupDialog({
  onAddGroup,
}: AddDeviceGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "camera",
    },
  });

  const handleSubmit = (data: FormData) => {
    onAddGroup(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Group
        </Button>
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
            onSubmit={form.handleSubmit(handleSubmit)}
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
              <Button type="submit">Add Group</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
