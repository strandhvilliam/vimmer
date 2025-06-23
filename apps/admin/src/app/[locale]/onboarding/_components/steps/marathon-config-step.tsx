// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
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
import { Upload, Calendar, FileText, Image, PencilIcon, X } from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";
import { getOnboardingLogoUploadAction } from "../../_actions/logo-upload-action";
import { useAction } from "next-safe-action/hooks";
import { AWS_CONFIG } from "@/lib/constants";
// import { Resource } from "sst";

const marathonConfigSchema = z.object({
  name: z.string().min(1, "Marathon name is required"),
  description: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type MarathonConfigForm = z.infer<typeof marathonConfigSchema>;

interface MarathonConfigStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const MARATHON_SETTINGS_CDN_URL = AWS_CONFIG.routers.settings;

interface LogoUploadState {
  previewUrl: string | null;
  isUploading: boolean;
  hasChanged: boolean;
}

export function MarathonConfigStep({
  onNext,
  onPrev,
  canGoBack,
}: MarathonConfigStepProps) {
  const { marathon, data, updateMarathonConfig } = useOnboarding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoState, setLogoState] = useState<LogoUploadState>({
    previewUrl: data.marathonConfig.logoUrl || null,
    isUploading: false,
    hasChanged: false,
  });

  const form = useForm<MarathonConfigForm>({
    resolver: zodResolver(marathonConfigSchema),
    defaultValues: {
      name: data.marathonConfig.name || "",
      description: data.marathonConfig.description || "",
      logoUrl: data.marathonConfig.logoUrl || "",
      startDate: data.marathonConfig.startDate
        ? new Date(data.marathonConfig.startDate).toISOString().slice(0, 16)
        : "",
      endDate: data.marathonConfig.endDate
        ? new Date(data.marathonConfig.endDate).toISOString().slice(0, 16)
        : "",
    },
  });

  const {
    executeAsync: generateLogoPresignedUrl,
    isExecuting: isGeneratingLogoPresignedUrl,
  } = useAction(getOnboardingLogoUploadAction);

  const handleSubmit = async (formData: MarathonConfigForm) => {
    const file = fileInputRef.current?.files?.[0];

    if (file) {
      const logoUrl = await handleLogoUpload(file);
      if (logoUrl) {
        formData.logoUrl = logoUrl;
      }
    }

    updateMarathonConfig({
      name: formData.name,
      description: formData.description,
      logoUrl: formData.logoUrl,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : undefined,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : undefined,
    });
    onNext();
  };

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

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    setLogoState((prev) => ({ ...prev, isUploading: true }));

    try {
      const response = await generateLogoPresignedUrl({
        domain: marathon.domain,
        currentKey: data.marathonConfig.logoUrl || null,
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
    form.setValue("logoUrl", data.marathonConfig.logoUrl || "", {
      shouldDirty: false,
    });

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
                    <FormLabel className="flex items-center gap-2">
                      <PencilIcon className="w-4 h-4" />
                      Marathon Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Stockholm Photo Marathon 2024"
                        {...field}
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A 24-hour photography challenge through the streets of Stockholm..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Marathon Logo
                    </FormLabel>
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
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Date & Time
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        End Date & Time
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  type="submit"
                  disabled={
                    logoState.isUploading || isGeneratingLogoPresignedUrl
                  }
                >
                  {logoState.isUploading ? "Uploading..." : "Continue"}
                </PrimaryButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
