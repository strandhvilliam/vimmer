// @ts-nocheck
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@vimmer/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { Input } from "@vimmer/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Badge } from "@vimmer/ui/components/badge";
import {
  DeviceGroup,
  deviceGroupSchema,
  commonDeviceTypes,
} from "@/lib/types/device-group";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeviceGroupFormProps {
  onSubmit: (data: DeviceGroup) => Promise<void>;
  defaultValues?: Partial<DeviceGroup>;
}

export function DeviceGroupForm({
  onSubmit,
  defaultValues,
}: DeviceGroupFormProps) {
  const router = useRouter();
  const form = useForm<DeviceGroup>({
    resolver: zodResolver(deviceGroupSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      icon: defaultValues?.icon ?? "camera",
      allowedDevices: defaultValues?.allowedDevices ?? [],
    },
  });

  const [newDevice, setNewDevice] = React.useState("");

  const addDevice = () => {
    if (!newDevice) return;
    const currentDevices = form.getValues("allowedDevices");
    if (!currentDevices.includes(newDevice)) {
      form.setValue("allowedDevices", [...currentDevices, newDevice]);
    }
    setNewDevice("");
  };

  const removeDevice = (device: string) => {
    const currentDevices = form.getValues("allowedDevices");
    form.setValue(
      "allowedDevices",
      currentDevices.filter((deviceName: string) => deviceName !== device)
    );
  };

  async function handleSubmit(data: DeviceGroup) {
    try {
      await onSubmit(data);
      form.reset();
      toast.success("Device group created successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create device group");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
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
                <Textarea
                  placeholder="Enter group description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                {/* <SelectContent>
                  {Object.entries(Icons).map(([key, Icon]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent> */}
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowedDevices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Devices</FormLabel>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Add device type"
                      value={newDevice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewDevice(e.target.value)
                      }
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addDevice();
                        }
                      }}
                    />
                  </FormControl>
                  <Button type="button" onClick={addDevice}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {field.value.map((device: string) => (
                    <Badge key={device} variant="secondary">
                      {device}
                      <button
                        type="button"
                        className="ml-1 hover:text-destructive"
                        onClick={() => removeDevice(device)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonDeviceTypes
                    .filter(
                      (deviceType: string) => !field.value.includes(deviceType)
                    )
                    .map((deviceType: string) => (
                      <Badge
                        key={deviceType}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => {
                          form.setValue("allowedDevices", [
                            ...field.value,
                            deviceType,
                          ]);
                        }}
                      >
                        + {deviceType}
                      </Badge>
                    ))}
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Device Group
        </Button>
      </form>
    </Form>
  );
}
