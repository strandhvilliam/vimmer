"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { Input } from "@vimmer/ui/components/input";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Smartphone, Camera, Film, Plus, X, Monitor, Zap } from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

const deviceGroupSchema = z.object({
  name: z.string().min(1, "Device group name is required"),
  description: z.string().optional(),
  icon: z.string(),
});

type DeviceGroupForm = z.infer<typeof deviceGroupSchema>;

interface DeviceGroupStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

export function DeviceGroupStep({
  onNext,
  onPrev,
  canGoBack,
}: DeviceGroupStepProps) {
  const { data, addDeviceGroup, removeDeviceGroup } = useOnboarding();
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const form = useForm<DeviceGroupForm>({
    resolver: zodResolver(deviceGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "camera",
    },
  });

  const handleAddGroup = (formData: DeviceGroupForm) => {
    const newGroup = {
      id: Date.now(), // Temporary ID for UI purposes
      ...formData,
      marathonId: data.marathonConfig.id || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDeviceGroup(newGroup as any);
    form.reset();
    setIsAddingGroup(false);
  };

  const handleContinue = () => {
    onNext();
  };

  const predefinedGroups = [
    {
      name: "Mobile Phone",
      description: "Smartphone cameras",
      icon: "smartphone",
    },
    {
      name: "DigitalCamera",
      description: "Digital cameras",
      icon: "camera",
    },
    {
      name: "Action Camera",
      description: "GoPro and similar action cameras",
      icon: "zap",
    },
  ];

  const addPredefinedGroup = (group: (typeof predefinedGroups)[0]) => {
    const newGroup = {
      id: Date.now(),
      ...group,
      marathonId: data.marathonConfig.id || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDeviceGroup(newGroup as any);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "smartphone":
        return <Smartphone className="w-4 h-4" />;
      case "film":
        return <Film className="w-4 h-4" />;
      case "monitor":
        return <Monitor className="w-4 h-4" />;
      case "zap":
        return <Zap className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk">
            Device Groups
          </CardTitle>
          <CardDescription className="">
            Organize participants by the type of camera or device they're using
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Device Groups */}
          {data.deviceGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Current Device Groups ({data.deviceGroups.length})
              </h3>
              <div className="grid gap-3">
                {data.deviceGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(group.icon)}
                      <div>
                        <span className="font-medium">{group.name}</span>
                        {group.description && (
                          <p className="text-sm text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDeviceGroup(group.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Device Groups */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Add</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {predefinedGroups.map((group, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(group.icon)}
                    <div>
                      <span className="font-medium">{group.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPredefinedGroup(group)}
                    disabled={data.deviceGroups.some(
                      (dg) => dg.name === group.name
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Device Group Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Device Group</h3>
              {!isAddingGroup && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingGroup(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Group
                </Button>
              )}
            </div>

            {isAddingGroup && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleAddGroup)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Professional DSLR" {...field} />
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
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="For professional photographers using high-end DSLR cameras"
                              className="resize-none"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        Add Group
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingGroup(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={!canGoBack}
            >
              Back
            </Button>
            <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
