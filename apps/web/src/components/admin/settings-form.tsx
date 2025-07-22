"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@vimmer/ui/components/input";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Label } from "@vimmer/ui/components/label";
import {
  ImagePlus,
  X,
  Check,
  Globe,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { Calendar } from "@vimmer/ui/components/calendar";
import { TimePickerInput } from "@vimmer/ui/components/time-picker";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { SettingsPhonePreview } from "./settings-phone-preview";
import { useForm } from "@tanstack/react-form";
import { getLogoUploadAction } from "@/lib/actions/logo-presigned-url-action";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@vimmer/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vimmer/ui/components/popover";
import { Button } from "@vimmer/ui/components/button";
import { format } from "date-fns";
import { useDomain } from "@/contexts/domain-context";
import {
  useQueryClient,
  useSuspenseQuery,
  useMutation,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@vimmer/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "@vimmer/ui/components/alert-dialog";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@vimmer/ui/lib/utils";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { Marathon } from "@vimmer/api/db/types";

const updateMarathonSettingsSchema = z.object({
  name: z.string().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  languages: z.array(z.string()).optional(),
});
type UpdateSettingsInput = z.infer<typeof updateMarathonSettingsSchema>;

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "sv", name: "Swedish" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "pl", name: "Polish" },
];

function isDateDifferent(
  date1: Date | null | undefined,
  date2: string | null | undefined,
): boolean {
  if (!date1 && !date2) return false;
  if (!date1 || !date2) return true;

  return new Date(date1).getTime() !== new Date(date2).getTime();
}

function arrayEquals(a: string[], b: string[]): boolean {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export default function SettingsFormWrapper({
  marathonSettingsRouterUrl,
}: {
  marathonSettingsRouterUrl: string;
}) {
  const trpc = useTRPC();
  const { domain } = useDomain();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  if (!marathon) {
    return <div>ERROR: Unable to load marathon</div>;
  }

  return (
    <SettingsForm
      initialData={marathon}
      marathonSettingsRouterUrl={marathonSettingsRouterUrl}
    />
  );
}

function SettingsForm({
  initialData,
  marathonSettingsRouterUrl,
}: {
  initialData: Marathon;
  marathonSettingsRouterUrl: string;
}) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [resetConfirmationText, setResetConfirmationText] = useState("");
  const router = useRouter();
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum([
      "general",
      "date-time",
      "languages",
      "danger",
    ]).withDefault("general"),
  );

  const [logoState, setLogoState] = useState<{
    previewUrl: string | null;
    isUploading: boolean;
    hasChanged: boolean;
  }>({
    previewUrl: null,
    isUploading: false,
    hasChanged: false,
  });

  const form = useForm({
    defaultValues: {
      name: initialData.name,
      logoUrl: initialData.logoUrl || "",
      startDate: initialData.startDate ? new Date(initialData.startDate) : null,
      endDate: initialData.endDate ? new Date(initialData.endDate) : null,
      description: initialData.description || "",
      languages: initialData.languages
        ? initialData.languages.split(",")
        : ["en"],
    } as UpdateSettingsInput,
    validators: {
      onChange: updateMarathonSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      const file = fileInputRef.current?.files?.[0];

      if (file) {
        const logoUrl = await handleLogoUpload(file);
        if (logoUrl) {
          value.logoUrl = logoUrl;
        }
      }

      if (value.logoUrl === "pending-upload") {
        value.logoUrl = initialData.logoUrl ?? undefined;
      }

      updateMarathonSettings({
        id: initialData.id,
        domain,
        data: {
          name: value.name,
          description: value.description,
          startDate: value.startDate
            ? value.startDate.toISOString()
            : undefined,
          endDate: value.endDate ? value.endDate.toISOString() : undefined,
          logoUrl: value.logoUrl,
        },
      });
    },
  });

  const previewMarathon = {
    ...initialData,
    name: form.state.values.name || initialData.name,
    description: form.state.values.description || initialData.description || "",
    startDate: form.state.values.startDate
      ? form.state.values.startDate.toISOString()
      : initialData.startDate,
    endDate: form.state.values.endDate
      ? form.state.values.endDate.toISOString()
      : initialData.endDate,
    logoUrl:
      logoState.previewUrl || form.state.values.logoUrl || initialData.logoUrl,
    languages: form.state.values.languages
      ? form.state.values.languages.join(",")
      : initialData.languages,
  };

  const { mutate: updateMarathonSettings, isPending: isUpdatingMarathon } =
    useMutation(
      trpc.marathons.update.mutationOptions({
        onSuccess: () => {
          toast.success("Marathon settings updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Something went wrong");
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.marathons.pathKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.rules.pathKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.validations.pathKey(),
          });
        },
      }),
    );

  const {
    executeAsync: generateLogoPresignedUrl,
    isExecuting: isGeneratingLogoPresignedUrl,
  } = useAction(getLogoUploadAction);

  const { mutate: resetMarathon, isPending: isResettingMarathon } = useMutation(
    trpc.marathons.reset.mutationOptions({
      onSuccess: () => {
        toast.success("Marathon reset successfully");
        setResetConfirmationText("");
        queryClient.invalidateQueries({
          queryKey: trpc.marathons.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.submissions.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.competitionClasses.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.deviceGroups.pathKey(),
        });
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to reset marathon");
      },
    }),
  );

  useEffect(() => {
    const fileInput = fileInputRef.current;
    if (!fileInput) return;

    const handleFileChange = () => {
      if (logoState.previewUrl) {
        URL.revokeObjectURL(logoState.previewUrl);
      }

      const file = fileInput.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setLogoState((prev) => ({
          ...prev,
          previewUrl: url,
          hasChanged: true,
        }));
        form.setFieldValue("logoUrl", "pending-upload");
      } else {
        setLogoState((prev) => ({
          ...prev,
          previewUrl: null,
          hasChanged: false,
        }));
      }
    };

    fileInput.addEventListener("change", handleFileChange);
    return () => {
      fileInput.removeEventListener("change", handleFileChange);
      if (logoState.previewUrl) {
        URL.revokeObjectURL(logoState.previewUrl);
      }
    };
  }, [logoState.previewUrl, form]);

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    setLogoState((prev) => ({ ...prev, isUploading: true }));

    try {
      const response = await generateLogoPresignedUrl({
        domain,
        currentKey: initialData.logoUrl,
      });

      if (!response?.data) {
        toast.error("Failed to generate logo upload URL");
        return null;
      }

      const { key, url } = response.data;

      await fetch(url, {
        method: "PUT",
        body: file,
      });

      const logoUrl = `${marathonSettingsRouterUrl}/${encodeURIComponent(key)}`;
      form.setFieldValue("logoUrl", logoUrl);
      return logoUrl;
    } catch (error) {
      toast.error("Failed to upload logo");
      return null;
    } finally {
      setLogoState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const handleRemoveLogo = () => {
    form.setFieldValue("logoUrl", initialData.logoUrl || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (logoState.previewUrl) {
      URL.revokeObjectURL(logoState.previewUrl);
    }

    setLogoState({
      previewUrl: null,
      isUploading: false,
      hasChanged: false,
    });

    const formValues = form.state.values;
    const isDirtyExceptLogo =
      formValues.name !== initialData.name ||
      formValues.description !== (initialData.description || "") ||
      isDateDifferent(formValues.startDate, initialData.startDate) ||
      isDateDifferent(formValues.endDate, initialData.endDate) ||
      !arrayEquals(
        formValues.languages || [],
        initialData.languages ? initialData.languages.split(",") : ["en"],
      );

    if (!isDirtyExceptLogo) {
      form.reset();
    }
  };

  const handleResetMarathon = () => {
    if (resetConfirmationText === initialData.name) {
      resetMarathon({ id: initialData.id });
    }
  };

  const isResetDisabled =
    resetConfirmationText !== initialData.name || isResettingMarathon;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="grid grid-cols-2 gap-12">
        <div>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(
                value as "general" | "date-time" | "languages" | "danger",
              )
            }
            className="space-y-6"
          >
            <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
              <TabsTrigger
                value="general"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="date-time"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Date & Time
              </TabsTrigger>
              <TabsTrigger
                value="languages"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Languages
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Danger Zone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <form.Field
                  name="name"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Marathon Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter marathon name"
                      />
                      {field.state.meta.isTouched &&
                      field.state.meta.errors.length ? (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      id="logo-upload"
                    />
                    {logoState.previewUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="w-[42px] h-[42px] flex items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={logoState.previewUrl}
                            alt="Contest logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full flex-1 relative h-[42px] rounded-lg overflow-hidden border bg-background flex items-center justify-between gap-3">
                          <div className="flex items-center justify-between h-full flex-1 pr-3">
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="flex items-center gap-2 px-3 h-full hover:bg-muted rounded-md text-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span className="text-sm">Remove logo</span>
                            </button>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              PNG, JPG, SVG • 400x400px • 2MB
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-[42px] h-[42px] rounded-full bg-muted flex items-center justify-center flex-shrink-0 ">
                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <label
                          htmlFor="logo-upload"
                          className="px-4 w-full flex items-center h-[42px] rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 bg-background transition-colors cursor-pointer gap-3"
                        >
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-sm text-muted-foreground">
                              Click to upload logo
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              PNG, JPG, SVG • 400x400px • 2MB
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <form.Field
                  name="description"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Description</Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter contest description, rules, and guidelines..."
                        className="min-h-[150px]"
                      />
                      {field.state.meta.isTouched &&
                      field.state.meta.errors.length ? (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="date-time" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div className="space-y-4">
                  <div className="flex gap-1 flex-col">
                    <h3 className="font-medium">Contest Schedule</h3>
                    <p className="text-xs text-muted-foreground">
                      Set the start and end dates for your marathon
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="startDate"
                      children={(field) => (
                        <div className="flex flex-col space-y-2">
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.state.value && "text-muted-foreground",
                                )}
                              >
                                {field.state.value ? (
                                  format(field.state.value, "PPP")
                                ) : (
                                  <span>Pick a start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.state.value || undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    // Preserve current time or set default time (12:00)
                                    const newDate = new Date(date);
                                    if (field.state.value) {
                                      newDate.setHours(
                                        field.state.value.getHours(),
                                      );
                                      newDate.setMinutes(
                                        field.state.value.getMinutes(),
                                      );
                                    } else {
                                      newDate.setHours(12);
                                      newDate.setMinutes(0);
                                    }
                                    field.handleChange(newDate);

                                    // If end date is before this date, update end date
                                    const endDate = form.state.values.endDate;
                                    if (endDate && endDate < newDate) {
                                      // Clone the new date and add 1 hour for end time
                                      const suggestedEndDate = new Date(
                                        newDate,
                                      );
                                      suggestedEndDate.setHours(
                                        suggestedEndDate.getHours() + 1,
                                      );
                                      form.setFieldValue(
                                        "endDate",
                                        suggestedEndDate,
                                      );
                                    }
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {field.state.meta.isTouched &&
                          field.state.meta.errors.length ? (
                            <p className="text-sm text-destructive">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />

                    <form.Field
                      name="endDate"
                      children={(field) => (
                        <div className="flex flex-col space-y-2">
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.state.value && "text-muted-foreground",
                                )}
                              >
                                {field.state.value ? (
                                  format(field.state.value, "PPP")
                                ) : (
                                  <span>Pick an end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.state.value || undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const newDate = new Date(date);
                                    if (field.state.value) {
                                      newDate.setHours(
                                        field.state.value.getHours(),
                                      );
                                      newDate.setMinutes(
                                        field.state.value.getMinutes(),
                                      );
                                    } else {
                                      newDate.setHours(13);
                                      newDate.setMinutes(0);
                                    }

                                    const startDate =
                                      form.state.values.startDate;
                                    if (
                                      startDate &&
                                      date.getFullYear() ===
                                        startDate.getFullYear() &&
                                      date.getMonth() ===
                                        startDate.getMonth() &&
                                      date.getDate() === startDate.getDate()
                                    ) {
                                      if (newDate <= startDate) {
                                        newDate.setHours(
                                          startDate.getHours() + 1,
                                        );
                                        newDate.setMinutes(
                                          startDate.getMinutes(),
                                        );
                                      }
                                    }

                                    field.handleChange(newDate);
                                  }
                                }}
                                disabled={(date) => {
                                  const startDate = form.state.values.startDate;
                                  if (!startDate) return false;

                                  return (
                                    date <
                                    new Date(
                                      startDate.getFullYear(),
                                      startDate.getMonth(),
                                      startDate.getDate(),
                                    )
                                  );
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {field.state.meta.isTouched &&
                          field.state.meta.errors.length ? (
                            <p className="text-sm text-destructive">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <form.Field
                        name="startDate"
                        children={(field) => (
                          <div>
                            <Label>Start Time</Label>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 border rounded-lg flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <TimePickerInput
                                  date={field.state.value || undefined}
                                  setDate={(date) => {
                                    if (date && field.state.value) {
                                      const newDate = new Date(
                                        field.state.value,
                                      );
                                      newDate.setHours(date.getHours());
                                      newDate.setMinutes(date.getMinutes());

                                      const endDate = form.state.values.endDate;
                                      if (
                                        endDate &&
                                        newDate.getFullYear() ===
                                          endDate.getFullYear() &&
                                        newDate.getMonth() ===
                                          endDate.getMonth() &&
                                        newDate.getDate() ===
                                          endDate.getDate() &&
                                        newDate >= endDate
                                      ) {
                                        const updatedEndDate = new Date(
                                          newDate,
                                        );
                                        updatedEndDate.setHours(
                                          updatedEndDate.getHours() + 1,
                                        );
                                        form.setFieldValue(
                                          "endDate",
                                          updatedEndDate,
                                        );
                                      }

                                      field.handleChange(newDate);
                                    }
                                  }}
                                  picker="hours"
                                  aria-label="Hours"
                                />
                                <span className="text-sm">:</span>
                                <TimePickerInput
                                  date={field.state.value || undefined}
                                  setDate={(date) => {
                                    if (date && field.state.value) {
                                      const newDate = new Date(
                                        field.state.value,
                                      );
                                      newDate.setHours(date.getHours());
                                      newDate.setMinutes(date.getMinutes());

                                      const endDate = form.state.values.endDate;
                                      if (
                                        endDate &&
                                        newDate.getFullYear() ===
                                          endDate.getFullYear() &&
                                        newDate.getMonth() ===
                                          endDate.getMonth() &&
                                        newDate.getDate() ===
                                          endDate.getDate() &&
                                        newDate >= endDate
                                      ) {
                                        const updatedEndDate = new Date(
                                          newDate,
                                        );
                                        updatedEndDate.setHours(
                                          updatedEndDate.getHours() + 1,
                                        );
                                        form.setFieldValue(
                                          "endDate",
                                          updatedEndDate,
                                        );
                                      }

                                      field.handleChange(newDate);
                                    }
                                  }}
                                  picker="minutes"
                                  aria-label="Minutes"
                                />
                              </div>
                            </div>
                            {field.state.meta.isTouched &&
                            field.state.meta.errors.length ? (
                              <p className="text-sm text-destructive">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <form.Field
                        name="endDate"
                        children={(field) => (
                          <div>
                            <Label>End Time</Label>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 border rounded-lg flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <TimePickerInput
                                  date={field.state.value || undefined}
                                  setDate={(date) => {
                                    if (date && field.state.value) {
                                      const newDate = new Date(
                                        field.state.value,
                                      );
                                      newDate.setHours(date.getHours());
                                      newDate.setMinutes(date.getMinutes());

                                      const startDate =
                                        form.state.values.startDate;
                                      if (
                                        startDate &&
                                        newDate.getFullYear() ===
                                          startDate.getFullYear() &&
                                        newDate.getMonth() ===
                                          startDate.getMonth() &&
                                        newDate.getDate() ===
                                          startDate.getDate() &&
                                        newDate <= startDate
                                      ) {
                                        return;
                                      }

                                      field.handleChange(newDate);
                                    }
                                  }}
                                  picker="hours"
                                  aria-label="Hours"
                                />
                                <span className="text-sm">:</span>
                                <TimePickerInput
                                  date={field.state.value || undefined}
                                  setDate={(date) => {
                                    if (date && field.state.value) {
                                      const newDate = new Date(
                                        field.state.value,
                                      );
                                      newDate.setHours(date.getHours());
                                      newDate.setMinutes(date.getMinutes());

                                      const startDate =
                                        form.state.values.startDate;
                                      if (
                                        startDate &&
                                        newDate.getFullYear() ===
                                          startDate.getFullYear() &&
                                        newDate.getMonth() ===
                                          startDate.getMonth() &&
                                        newDate.getDate() ===
                                          startDate.getDate() &&
                                        newDate <= startDate
                                      ) {
                                        return;
                                      }

                                      field.handleChange(newDate);
                                    }
                                  }}
                                  picker="minutes"
                                  aria-label="Minutes"
                                />
                              </div>
                            </div>
                            {field.state.meta.isTouched &&
                            field.state.meta.errors.length ? (
                              <p className="text-sm text-destructive">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-muted flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium">
                        Marathon Duration:
                      </span>
                      {form.state.values.startDate &&
                      form.state.values.endDate ? (
                        <span className="text-sm">
                          {format(form.state.values.startDate, "PPP")} -{" "}
                          {format(form.state.values.endDate, "PPP")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Select both dates to see duration
                        </span>
                      )}
                    </div>
                    {form.state.values.startDate &&
                      form.state.values.endDate && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-muted-foreground">
                            {format(form.state.values.startDate, "kk:mm")} -{" "}
                            {format(form.state.values.endDate, "kk:mm")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="languages" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div className="space-y-4 relative">
                  <div className="flex gap-1 flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-muted-foreground">
                        Available Languages
                      </h3>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        Coming soon...
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select the languages your marathon should support
                    </p>
                  </div>

                  <form.Field
                    name="languages"
                    children={(field) => (
                      <div>
                        <div className="relative">
                          <Command className="rounded-lg border opacity-50 pointer-events-none">
                            <CommandInput
                              placeholder="Search languages..."
                              className="flex w-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                              disabled
                            />
                            <CommandList>
                              <CommandEmpty>No languages found.</CommandEmpty>
                              {AVAILABLE_LANGUAGES.map((language) => (
                                <CommandItem
                                  key={language.code}
                                  className="flex items-center gap-2 px-4 py-2"
                                >
                                  <div className="flex items-center justify-center rounded-sm size-5 border mr-2">
                                    {field.state.value?.includes(
                                      language.code,
                                    ) && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <Globe className="h-3 w-3 opacity-50" />
                                  <span className="font-medium text-sm">
                                    {language.name}
                                  </span>
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {language.code}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </div>
                        {field.state.meta.isTouched &&
                        field.state.meta.errors.length ? (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="space-y-6">
              <div className="mt-0 bg-white">
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-rocgrotesk">
                    Danger Zone
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-4">
                      <p>
                        Reset this marathon to clear all participants,
                        submissions, topics, competition classes, and device
                        groups. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Reset Marathon
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-rocgrotesk">
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 border border-muted p-4 rounded-lg">
                              This action cannot be undone. This will
                              permanently delete all:
                              <div className="list-disc list-inside mt-2 space-y-1">
                                <li>Participants and their submissions</li>
                                <li>Topics and their content</li>
                                <li>Competition classes and device groups</li>
                                <li>Jury invitations and validation results</li>
                                <li>All related data and configurations</li>
                              </div>
                            </div>
                          </AlertDialogHeader>
                          <div className="space-y-2">
                            <Label htmlFor="reset-confirmation">
                              Type <strong>{initialData.name}</strong> to
                              confirm:
                            </Label>
                            <Input
                              id="reset-confirmation"
                              value={resetConfirmationText}
                              onChange={(e) =>
                                setResetConfirmationText(e.target.value)
                              }
                              placeholder={initialData.name}
                              className="font-mono"
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setResetConfirmationText("")}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleResetMarathon}
                              disabled={isResetDisabled}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isResettingMarathon
                                ? "Resetting..."
                                : "Reset Marathon"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.canSubmit]}
            children={([isSubmitting, canSubmit]) => (
              <>
                {activeTab !== "danger" && (
                  <div className="flex mt-6">
                    <PrimaryButton
                      type="submit"
                      disabled={isSubmitting || !canSubmit}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </PrimaryButton>
                  </div>
                )}
              </>
            )}
          />

          {/* Danger Zone */}
          {/* Removed from here, now in its own tab */}
        </div>

        <div className="relative w-fit">
          <h2 className="text-lg font-medium mb-4 font-rocgrotesk">Preview</h2>
          <div className="sticky top-8 bg-background shadow-lg border border-border p-8 rounded-lg">
            <SettingsPhonePreview marathon={previewMarathon} />
          </div>
        </div>
      </div>
    </form>
  );
}
