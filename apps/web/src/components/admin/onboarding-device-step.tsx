"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Smartphone, Camera, Film, Plus, X, Monitor, Zap } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

const deviceGroupSchema = z.object({
  name: z.string().min(1, "Device group name is required"),
  description: z.string().optional(),
  icon: z.string(),
});

type DeviceGroupForm = z.infer<typeof deviceGroupSchema>;

interface OnboardingDeviceStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

export function OnboardingDeviceStep({
  onNext,
  onPrev,
  canGoBack,
}: OnboardingDeviceStepProps) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain }),
  );

  const { data: deviceGroups } = useSuspenseQuery(
    trpc.deviceGroups.getByDomain.queryOptions({ domain }),
  );

  const { mutate: createDeviceGroup, isPending: isCreating } = useMutation(
    trpc.deviceGroups.create.mutationOptions({
      onSuccess: () => {
        toast.success("Device group added successfully");
        form.reset();
        setIsAddingGroup(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add device group");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.deviceGroups.pathKey(),
        });
      },
    }),
  );

  const { mutate: deleteDeviceGroup, isPending: isDeleting } = useMutation(
    trpc.deviceGroups.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Device group removed successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to remove device group");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.deviceGroups.pathKey(),
        });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      icon: "camera",
    } satisfies DeviceGroupForm,
    validators: {
      onChange: (value) => {
        return deviceGroupSchema.parse(value);
      },
    },
    onSubmit: ({ value }) => {
      handleAddGroup(value);
    },
  });

  const handleAddGroup = (formData: DeviceGroupForm) => {
    if (!marathon?.id) {
      toast.error("Marathon not found");
      return;
    }

    createDeviceGroup({
      data: {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        marathonId: marathon.id,
      },
    });
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
      name: "Digital Camera",
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
    if (!marathon?.id) {
      toast.error("Marathon not found");
      return;
    }

    createDeviceGroup({
      data: {
        name: group.name,
        description: group.description,
        icon: group.icon,
        marathonId: marathon.id,
      },
    });
  };

  const handleRemoveDeviceGroup = (id: number) => {
    deleteDeviceGroup({ id });
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
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk">
            Device Groups
          </CardTitle>
          <CardDescription className="">
            Organize participants by the type of camera or device they're using
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {deviceGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Current Device Groups ({deviceGroups.length})
              </h3>
              <div className="grid gap-3">
                {deviceGroups.map((group) => (
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
                      onClick={() => handleRemoveDeviceGroup(group.id)}
                      disabled={isDeleting}
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
                    disabled={
                      isCreating ||
                      deviceGroups.some((dg) => dg.name === group.name)
                    }
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) =>
                        !value || value.length < 1
                          ? "Device group name is required"
                          : undefined,
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Device Group Name
                        </label>
                        <Input
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Professional DSLR"
                          disabled={isCreating}
                        />
                        {field.state.meta.isTouched &&
                        field.state.meta.errors.length ? (
                          <p className="text-sm font-medium text-destructive">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />

                  <form.Field
                    name="description"
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Description (Optional)
                        </label>
                        <Textarea
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="For professional photographers using high-end DSLR cameras"
                          className="resize-none"
                          rows={2}
                          disabled={isCreating}
                        />
                        {field.state.meta.isTouched &&
                        field.state.meta.errors.length ? (
                          <p className="text-sm font-medium text-destructive">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isCreating}>
                      {isCreating ? "Adding..." : "Add Group"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingGroup(false);
                        form.reset();
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
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
            <PrimaryButton
              disabled={deviceGroups.length === 0}
              onClick={handleContinue}
            >
              Continue
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
