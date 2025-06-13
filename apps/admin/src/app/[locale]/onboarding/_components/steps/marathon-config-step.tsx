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
import {
  Upload,
  Calendar,
  MapPin,
  FileText,
  Image,
  PencilIcon,
} from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

const marathonConfigSchema = z.object({
  name: z.string().min(1, "Marathon name is required"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
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

export function MarathonConfigStep({
  onNext,
  onPrev,
  canGoBack,
}: MarathonConfigStepProps) {
  const { data, updateMarathonConfig } = useOnboarding();
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSubmit = (formData: MarathonConfigForm) => {
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

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload to storage
      // For now, we'll use a placeholder URL
      const fakeUrl = `https://example.com/logos/${file.name}`;
      form.setValue("logoUrl", fakeUrl);
    } catch (error) {
      console.error("Failed to upload logo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl">
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
                    <div className="space-y-3">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>or</span>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {isUploading ? "Uploading..." : "Upload Logo"}
                          </Button>
                        </label>
                      </div>
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
                <PrimaryButton type="submit">Continue</PrimaryButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
