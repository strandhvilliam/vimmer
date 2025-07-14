"use client";

import { useState, useRef, useEffect } from "react";
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
import { Upload, Calendar, FileText, Image, PencilIcon, X } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";
import { getOnboardingLogoUploadAction } from "../../_actions/logo-upload-action";
import { useAction } from "next-safe-action/hooks";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Marathon } from "@vimmer/api/db/types";

interface MarathonConfigStepProps {
  marathon: Marathon;
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  marathonSettingsRouterUrl: string;
}

interface LogoUploadState {
  previewUrl: string | null;
  isUploading: boolean;
  hasChanged: boolean;
}

export function MarathonConfigStep({
  marathonSettingsRouterUrl,
  marathon,
  onNext,
  onPrev,
  canGoBack,
}: MarathonConfigStepProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoState, setLogoState] = useState<LogoUploadState>({
    previewUrl: marathon.logoUrl || null,
    isUploading: false,
    hasChanged: false,
  });

  const form = useForm({
    defaultValues: {
      name: marathon.name ?? "",
      description: marathon.description ?? "",
      logoUrl: marathon.logoUrl ?? "",
      startDate: marathon.startDate
        ? new Date(marathon.startDate).toISOString().slice(0, 16)
        : "",
      endDate: marathon.endDate
        ? new Date(marathon.endDate).toISOString().slice(0, 16)
        : "",
    },
    onSubmit: async ({ value }) => {
      console.log("value", value);
      let logoUrl = value.logoUrl;

      const file = fileInputRef.current?.files?.[0];
      if (file && logoState.hasChanged) {
        const uploadedLogoUrl = await handleLogoUpload(file);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
        }
      }

      if (logoUrl === "pending-upload") {
        logoUrl = marathon.logoUrl ?? "";
      }

      updateMarathon({
        domain: marathon.domain,
        data: {
          name: value.name,
          description: value.description,
          logoUrl: logoUrl || undefined,
          startDate: value.startDate
            ? new Date(value.startDate).toISOString()
            : undefined,
          endDate: value.endDate
            ? new Date(value.endDate).toISOString()
            : undefined,
        },
      });
    },
  });

  const { mutate: updateMarathon, isPending: isUpdating } = useMutation(
    trpc.marathons.updateByDomain.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch marathon data
        queryClient.invalidateQueries({
          queryKey: trpc.marathons.pathKey(),
        });
        toast.success("Marathon configuration updated successfully!");
        onNext();
      },
      onError: (error) => {
        console.error("Failed to update marathon:", error);
        toast.error(
          "Failed to update marathon configuration. Please try again."
        );
      },
    })
  );

  const { executeAsync: generateLogoPresignedUrl } = useAction(
    getOnboardingLogoUploadAction
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
        domain: marathon.domain,
        currentKey: marathon.logoUrl || null,
      });

      if (!response?.data) {
        toast.error("Failed to generate logo upload URL");
        return null;
      }

      const { key, url } = response.data;

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      const logoUrl = `${marathonSettingsRouterUrl}/${key}`;
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
    form.setFieldValue("logoUrl", marathon.logoUrl || "");

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
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk">
            Marathon Configuration
          </CardTitle>
          <CardDescription className="">
            Set up your marathon's basic information and branding
          </CardDescription>
        </CardHeader>

        <CardContent>
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
              children={(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                    <PencilIcon className="w-4 h-4" />
                    Marathon Name
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Stockholm Photo Marathon 2024"
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
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </label>
                  <Textarea
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="A 24-hour photography challenge through the streets of Stockholm..."
                    className="resize-none"
                    rows={3}
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
              name="logoUrl"
              children={(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Marathon Logo
                  </label>
                  <div className="space-y-4">
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
                        <div className="w-[42px] h-[42px] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Upload className="h-5 w-5 text-muted-foreground" />
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

                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      name={field.name}
                      value={field.state.value}
                    />
                  </div>
                  {field.state.meta.isTouched &&
                  field.state.meta.errors.length ? (
                    <p className="text-sm font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <form.Field
                name="startDate"
                children={(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date & Time
                    </label>
                    <Input
                      id={field.name}
                      type="datetime-local"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                name="endDate"
                children={(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
            </div>

            <form.Subscribe
              selector={(state) => [state.isSubmitting, state.canSubmit]}
              children={([isSubmitting]) => (
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onPrev}
                    disabled={!canGoBack}
                  >
                    Back
                  </Button>
                  <PrimaryButton onClick={() => form.handleSubmit()}>
                    {logoState.isUploading || isSubmitting
                      ? "Uploading..."
                      : "Continue"}
                  </PrimaryButton>
                </div>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
