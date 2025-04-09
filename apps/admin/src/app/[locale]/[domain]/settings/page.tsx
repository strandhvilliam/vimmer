"use client";

import React from "react";
import { Card } from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Label } from "@vimmer/ui/components/label";
import { Separator } from "@vimmer/ui/components/separator";
import { ImagePlus, X } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { format } from "date-fns";
import { Calendar } from "@vimmer/ui/components/calendar";
import { TimePickerInput } from "@vimmer/ui/components/time-picker";
import { getLogoUploadUrl } from "./actions";
import { useParams } from "next/navigation";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
interface ContestSettings {
  name: string;
  logo: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  description: string;
  rules: string;
}

function PhonePreview({ settings }: { settings: ContestSettings }) {
  return (
    <div className="w-[320px] h-[640px] bg-muted border-8 border-muted rounded-3xl overflow-hidden shadow-2xl flex flex-col fixed">
      <div className="flex-1 ">
        <div className="relative h-48 bg-muted flex items-start pt-4 justify-center">
          {settings.logo ? (
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl">
              <img
                src={settings.logo}
                alt="Contest banner"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <ImagePlus className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2  text-foreground">
            <h2 className="text-xl font-bold truncate">
              {settings.name || "Marathon Name"}
            </h2>
          </div>
        </div>

        <div className="p-4 space-y-6 rounded-3xl h-full bg-white  overflow-hidden">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Starts</div>
                <div>
                  {settings.startTime
                    ? format(settings.startTime, "PPP")
                    : "No start date"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {settings.startTime
                    ? format(settings.startTime, "p")
                    : "HH:MM"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Ends</div>
                <div>
                  {settings.endTime
                    ? format(settings.endTime, "PPP")
                    : "No end date"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {settings.endTime ? format(settings.endTime, "p") : "HH:MM"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-medium">About</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {settings.description || "No description provided."}
            </p>
          </div>

          <Separator />

          {/* Rules */}
          <div className="space-y-3">
            <h3 className="font-medium">Contest Rules</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {settings.rules || "No rules specified."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<ContestSettings>({
    name: "",
    logo: "",
    startTime: undefined,
    endTime: undefined,
    description: "",
    rules: "",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const params = useParams();

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log("Saving settings:", settings);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await getLogoUploadUrl({
        domain: params.domain as string,
      });
      if (!result?.data) throw new Error("Failed to get upload URL");

      const formData = new FormData();
      Object.entries(result.data.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("Content-Type", file.type);
      formData.append("file", file);

      const uploadResponse = await fetch(result.data.url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const logoUrl = `${result.data.url}/${result.data.key}`;
      setSettings({ ...settings, logo: logoUrl });

      toast({
        title: "Logo uploaded",
        description: "Your logo has been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container max-w-[1400px] mx-auto py-8">
      <div className="flex flex-col mb-8 gap-1">
        <h1 className="text-2xl font-semibold font-rocgrotesk">
          Contest Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure your marathon settings here.
        </p>
      </div>

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
                value="info"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="contestName">Marathon Name</Label>
                  <Input
                    id="contestName"
                    placeholder="Enter marathon name"
                    value={settings.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="logo-upload"
                    />
                    {settings.logo ? (
                      <div className="flex items-center gap-3">
                        <div className="w-[42px] h-[42px] flex items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={settings.logo}
                            alt="Contest logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full flex-1 relative h-[42px] rounded-lg overflow-hidden border bg-background flex items-center justify-between gap-3">
                          <div className="flex items-center justify-between h-full flex-1 pr-3">
                            <button
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
              </div>
            </TabsContent>

            <TabsContent value="date-time" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label className="">Contest Schedule</Label>
                  <Card className="p-2 w-full">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={settings.startTime}
                      selected={{
                        from: settings.startTime,
                        to: settings.endTime,
                      }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          const newStartTime = settings.startTime
                            ? new Date(
                                range.from.setHours(
                                  settings.startTime.getHours(),
                                  settings.startTime.getMinutes()
                                )
                              )
                            : range.from;
                          const newEndTime = settings.endTime
                            ? new Date(
                                range.to.setHours(
                                  settings.endTime.getHours(),
                                  settings.endTime.getMinutes()
                                )
                              )
                            : range.to;
                          setSettings({
                            ...settings,
                            startTime: newStartTime,
                            endTime: newEndTime,
                          });
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </Card>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <div className="p-1 space-x-2 flex items-center justify-center border rounded-lg">
                        <TimePickerInput
                          date={settings.startTime}
                          setDate={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              if (settings.startTime) {
                                newDate.setFullYear(
                                  settings.startTime.getFullYear()
                                );
                                newDate.setMonth(settings.startTime.getMonth());
                                newDate.setDate(settings.startTime.getDate());
                              }
                              setSettings({ ...settings, startTime: newDate });
                            }
                          }}
                          picker="hours"
                          aria-label="Hours"
                        />
                        <span className="text-sm">:</span>
                        <TimePickerInput
                          date={settings.startTime}
                          setDate={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              if (settings.startTime) {
                                newDate.setFullYear(
                                  settings.startTime.getFullYear()
                                );
                                newDate.setMonth(settings.startTime.getMonth());
                                newDate.setDate(settings.startTime.getDate());
                              }
                              setSettings({ ...settings, startTime: newDate });
                            }
                          }}
                          picker="minutes"
                          aria-label="Minutes"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <div className="p-1 space-x-2 flex items-center justify-center border rounded-lg">
                        <TimePickerInput
                          date={settings.startTime}
                          setDate={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              if (settings.startTime) {
                                newDate.setFullYear(
                                  settings.startTime.getFullYear()
                                );
                                newDate.setMonth(settings.startTime.getMonth());
                                newDate.setDate(settings.startTime.getDate());
                              }
                              setSettings({ ...settings, startTime: newDate });
                            }
                          }}
                          picker="hours"
                          aria-label="Hours"
                        />
                        <span className="text-sm">:</span>
                        <TimePickerInput
                          date={settings.startTime}
                          setDate={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              if (settings.startTime) {
                                newDate.setFullYear(
                                  settings.startTime.getFullYear()
                                );
                                newDate.setMonth(settings.startTime.getMonth());
                                newDate.setDate(settings.startTime.getDate());
                              }
                              setSettings({ ...settings, startTime: newDate });
                            }
                          }}
                          picker="minutes"
                          aria-label="Minutes"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter contest description, rules, and guidelines..."
                    className="min-h-[150px]"
                    value={settings.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSettings({ ...settings, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Rules Information</Label>
                  <Textarea
                    id="rules"
                    placeholder="Enter any special rules or requirements..."
                    className="min-h-[100px]"
                    value={settings.rules}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSettings({ ...settings, rules: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex mt-6">
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </div>
        </div>

        <div className="relative ">
          <div className="sticky top-8">
            <PhonePreview settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
