"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Label } from "@vimmer/ui/components/label";
import {
  ImagePlus,
  X,
  Check,
  Globe,
  Search,
  Calendar as CalendarIcon,
  Clock,
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
import { PhonePreview } from "./phone-preview";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLogoUploadAction } from "../_actions/logo-presigned-url-action";
import { Marathon } from "@vimmer/supabase/types";
import { updateMarathonSettingsAction } from "../_actions/update-marathon-settings-action";
import { useAction } from "next-safe-action/hooks";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import {
  updateMarathonSettingsSchema,
  UpdateSettingsInput,
} from "@/lib/schemas";
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
import { cn } from "@vimmer/ui/lib/utils";
import { format } from "date-fns";

interface SettingsFormProps {
  domain: string;
  initialData: Marathon;
}

const MARATHON_SETTINGS_CDN_URL = "d1irn00yzrui1x.cloudfront.net";

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

// Helper function to compare dates
function isDateDifferent(
  date1: Date | null | undefined,
  date2: string | null | undefined
): boolean {
  if (!date1 && !date2) return false;
  if (!date1 || !date2) return true;

  return new Date(date1).getTime() !== new Date(date2).getTime();
}

// Helper function to compare arrays
function arrayEquals(a: string[], b: string[]): boolean {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export default function SettingsForm({
  domain,
  initialData,
}: SettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoState, setLogoState] = useState<{
    previewUrl: string | null;
    isUploading: boolean;
    hasChanged: boolean;
  }>({
    previewUrl: null,
    isUploading: false,
    hasChanged: false,
  });

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateMarathonSettingsSchema),
    defaultValues: {
      domain,
      name: initialData.name,
      logoUrl: initialData.logoUrl || "",
      startDate: initialData.startDate ? new Date(initialData.startDate) : null,
      endDate: initialData.endDate ? new Date(initialData.endDate) : null,
      description: initialData.description || "",
      languages: initialData.languages
        ? initialData.languages.split(",")
        : ["en"],
    },
  });

  const formValues = useWatch({
    control: form.control,
  });

  const previewMarathon = {
    ...initialData,
    name: formValues.name || initialData.name,
    description: formValues.description || initialData.description || "",
    startDate: formValues.startDate
      ? formValues.startDate.toISOString()
      : initialData.startDate,
    endDate: formValues.endDate
      ? formValues.endDate.toISOString()
      : initialData.endDate,
    logoUrl: logoState.previewUrl || formValues.logoUrl || initialData.logoUrl,
    languages: formValues.languages
      ? formValues.languages.join(",")
      : initialData.languages,
  };

  const { execute: updateMarathonSettings, isExecuting: isUpdatingMarathon } =
    useAction(updateMarathonSettingsAction, {
      onSuccess: () => {
        toast.success("Marathon settings updated successfully");
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Something went wrong");
      },
    });

  const {
    executeAsync: generateLogoPresignedUrl,
    isExecuting: isGeneratingLogoPresignedUrl,
  } = useAction(getLogoUploadAction);

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
        form.setValue("logoUrl", "pending-upload", { shouldDirty: true });
        form.trigger();
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

  const handleLanguageToggle = (languageCode: string) => {
    const currentLanguages = formValues.languages || [];
    const newSelection = currentLanguages.includes(languageCode)
      ? currentLanguages.filter((code) => code !== languageCode)
      : [...currentLanguages, languageCode];

    form.setValue("languages", newSelection, { shouldDirty: true });
  };

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

      const logoUrl = `https://${MARATHON_SETTINGS_CDN_URL}/${key}`;
      form.setValue("logoUrl", logoUrl, { shouldDirty: true });
      return logoUrl;
    } catch (error) {
      toast.error("Failed to upload logo");
      return null;
    } finally {
      setLogoState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const handleRemoveLogo = () => {
    form.setValue("logoUrl", initialData.logoUrl || "", { shouldDirty: false });

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

    // Check if this was the only change and reset form state if needed
    const formValues = form.getValues();
    const isDirtyExceptLogo =
      formValues.name !== initialData.name ||
      formValues.description !== (initialData.description || "") ||
      isDateDifferent(formValues.startDate, initialData.startDate) ||
      isDateDifferent(formValues.endDate, initialData.endDate) ||
      !arrayEquals(
        formValues.languages || [],
        initialData.languages ? initialData.languages.split(",") : ["en"]
      );

    if (!isDirtyExceptLogo) {
      form.reset({
        domain,
        name: initialData.name,
        logoUrl: initialData.logoUrl || "",
        startDate: initialData.startDate
          ? new Date(initialData.startDate)
          : null,
        endDate: initialData.endDate ? new Date(initialData.endDate) : null,
        description: initialData.description || "",
        languages: initialData.languages
          ? initialData.languages.split(",")
          : ["en"],
      });
    }
  };

  const onSubmit = async (data: UpdateSettingsInput) => {
    const file = fileInputRef.current?.files?.[0];

    if (file) {
      const logoUrl = await handleLogoUpload(file);
      if (logoUrl) {
        data.logoUrl = logoUrl;
      }
    }

    updateMarathonSettings(data);
  };

  const isFormSubmitDisabled =
    isUpdatingMarathon ||
    isGeneratingLogoPresignedUrl ||
    logoState.isUploading ||
    (!form.formState.isDirty && !logoState.hasChanged);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <Tabs defaultValue="general" className="space-y-6">
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
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Marathon Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter marathon name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter contest description, rules, and guidelines..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a start date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      // Preserve current time or set default time (12:00)
                                      const newDate = new Date(date);
                                      if (field.value) {
                                        newDate.setHours(
                                          field.value.getHours()
                                        );
                                        newDate.setMinutes(
                                          field.value.getMinutes()
                                        );
                                      } else {
                                        newDate.setHours(12);
                                        newDate.setMinutes(0);
                                      }
                                      field.onChange(newDate);

                                      // If end date is before this date, update end date
                                      const endDate = form.getValues("endDate");
                                      if (endDate && endDate < newDate) {
                                        // Clone the new date and add 1 hour for end time
                                        const suggestedEndDate = new Date(
                                          newDate
                                        );
                                        suggestedEndDate.setHours(
                                          suggestedEndDate.getHours() + 1
                                        );
                                        form.setValue(
                                          "endDate",
                                          suggestedEndDate,
                                          { shouldDirty: true }
                                        );
                                      }
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick an end date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      const newDate = new Date(date);
                                      if (field.value) {
                                        newDate.setHours(
                                          field.value.getHours()
                                        );
                                        newDate.setMinutes(
                                          field.value.getMinutes()
                                        );
                                      } else {
                                        newDate.setHours(13);
                                        newDate.setMinutes(0);
                                      }

                                      const startDate =
                                        form.getValues("startDate");
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
                                            startDate.getHours() + 1
                                          );
                                          newDate.setMinutes(
                                            startDate.getMinutes()
                                          );
                                        }
                                      }

                                      field.onChange(newDate);
                                    }
                                  }}
                                  disabled={(date) => {
                                    const startDate =
                                      form.getValues("startDate");
                                    if (!startDate) return false;

                                    return (
                                      date <
                                      new Date(
                                        startDate.getFullYear(),
                                        startDate.getMonth(),
                                        startDate.getDate()
                                      )
                                    );
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <div className="p-2 border rounded-lg flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <TimePickerInput
                                      date={field.value || undefined}
                                      setDate={(date) => {
                                        if (date && field.value) {
                                          const newDate = new Date(field.value);
                                          newDate.setHours(date.getHours());
                                          newDate.setMinutes(date.getMinutes());

                                          const endDate =
                                            form.getValues("endDate");
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
                                              newDate
                                            );
                                            updatedEndDate.setHours(
                                              updatedEndDate.getHours() + 1
                                            );
                                            form.setValue(
                                              "endDate",
                                              updatedEndDate,
                                              { shouldDirty: true }
                                            );
                                          }

                                          field.onChange(newDate);
                                        }
                                      }}
                                      picker="hours"
                                      aria-label="Hours"
                                    />
                                    <span className="text-sm">:</span>
                                    <TimePickerInput
                                      date={field.value || undefined}
                                      setDate={(date) => {
                                        if (date && field.value) {
                                          const newDate = new Date(field.value);
                                          newDate.setHours(date.getHours());
                                          newDate.setMinutes(date.getMinutes());

                                          const endDate =
                                            form.getValues("endDate");
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
                                              newDate
                                            );
                                            updatedEndDate.setHours(
                                              updatedEndDate.getHours() + 1
                                            );
                                            form.setValue(
                                              "endDate",
                                              updatedEndDate,
                                              { shouldDirty: true }
                                            );
                                          }

                                          field.onChange(newDate);
                                        }
                                      }}
                                      picker="minutes"
                                      aria-label="Minutes"
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <div className="p-2 border rounded-lg flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <TimePickerInput
                                      date={field.value || undefined}
                                      setDate={(date) => {
                                        if (date && field.value) {
                                          const newDate = new Date(field.value);
                                          newDate.setHours(date.getHours());
                                          newDate.setMinutes(date.getMinutes());

                                          const startDate =
                                            form.getValues("startDate");
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

                                          field.onChange(newDate);
                                        }
                                      }}
                                      picker="hours"
                                      aria-label="Hours"
                                    />
                                    <span className="text-sm">:</span>
                                    <TimePickerInput
                                      date={field.value || undefined}
                                      setDate={(date) => {
                                        if (date && field.value) {
                                          const newDate = new Date(field.value);
                                          newDate.setHours(date.getHours());
                                          newDate.setMinutes(date.getMinutes());

                                          const startDate =
                                            form.getValues("startDate");
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

                                          field.onChange(newDate);
                                        }
                                      }}
                                      picker="minutes"
                                      aria-label="Minutes"
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
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
                        {formValues.startDate && formValues.endDate ? (
                          <span className="text-sm">
                            {format(formValues.startDate, "PPP")} -{" "}
                            {format(formValues.endDate, "PPP")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Select both dates to see duration
                          </span>
                        )}
                      </div>
                      {formValues.startDate && formValues.endDate && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-muted-foreground">
                            {format(formValues.startDate, "kk:mm")} -{" "}
                            {format(formValues.endDate, "kk:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="languages" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                  <div className="space-y-4">
                    <div className="flex gap-1 flex-col">
                      <h3 className="font-medium">Available Languages</h3>
                      <p className="text-xs text-muted-foreground">
                        Select the languages your marathon should support
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="languages"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <Command className="rounded-lg border ">
                              <CommandInput
                                placeholder="Search languages..."
                                className="flex w-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                              />
                              <CommandList>
                                <CommandEmpty>No languages found.</CommandEmpty>
                                {AVAILABLE_LANGUAGES.map((language) => (
                                  <CommandItem
                                    key={language.code}
                                    onSelect={() =>
                                      handleLanguageToggle(language.code)
                                    }
                                    className="flex items-center gap-2 px-4 py-2"
                                  >
                                    <div className="flex items-center justify-center rounded-sm size-5 border mr-2">
                                      {formValues.languages?.includes(
                                        language.code
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex mt-6">
              <PrimaryButton type="submit" disabled={isFormSubmitDisabled}>
                {isUpdatingMarathon || logoState.isUploading
                  ? "Saving..."
                  : "Save Changes"}
              </PrimaryButton>
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-8">
              <PhonePreview marathon={previewMarathon} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
