"use client";

import React, { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@vimmer/ui/components/sheet";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { Textarea } from "@vimmer/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { Send } from "lucide-react";
import { toast } from "@vimmer/ui/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";

import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import {
  CompetitionClass,
  DeviceGroup,
  Marathon,
  Topic,
} from "@vimmer/supabase/types";
import { createJuryInvitationAction } from "../_actions/jury-invitation-actions";

const formSchema = z.object({
  displayName: z.string(),
  email: z.string().email({ message: "Invalid email address." }),
  notes: z.string().optional(),
  competitionClassId: z.string().optional(),
  deviceGroupId: z.string().optional(),
  topicId: z.string().optional(),
  expiryDays: z.coerce
    .number()
    .min(1, { message: "Expiry must be at least 1 day." })
    .max(90, { message: "Expiry cannot exceed 90 days." })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateInvitationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionClassesPromise: Promise<CompetitionClass[]>;
  topicsPromise: Promise<Topic[]>;
  marathonPromise: Promise<Marathon | null>;
  deviceGroupsPromise: Promise<DeviceGroup[]>;
}

export function CreateInvitationSheet({
  open,
  onOpenChange,
  competitionClassesPromise,
  topicsPromise,
  marathonPromise,
  deviceGroupsPromise,
}: CreateInvitationSheetProps) {
  const competitionClasses = use(competitionClassesPromise);
  const topics = use(topicsPromise);
  const marathon = use(marathonPromise);
  const deviceGroups = use(deviceGroupsPromise);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      notes: "",
      competitionClassId: "",
      deviceGroupId: "",
      topicId: "",
      expiryDays: 14,
    },
  });

  const resetForm = () => {
    form.reset();
  };

  const handleSendInvitation = async (data: FormValues) => {
    setLoading(true);

    try {
      if (!marathon) {
        throw new Error("Marathon not found");
      }

      const parsedCompetitionClassId = data.competitionClassId
        ? parseInt(data.competitionClassId)
        : null;
      const parsedDeviceGroupId = data.deviceGroupId
        ? parseInt(data.deviceGroupId)
        : null;
      const parsedTopicId = data.topicId ? parseInt(data.topicId) : null;

      // Call our server action instead of the direct mutation
      await createJuryInvitationAction({
        displayName: data.displayName,
        email: data.email,
        notes: data.notes,
        competitionClassId: parsedCompetitionClassId,
        deviceGroupId: parsedDeviceGroupId,
        topicId: parsedTopicId,
        expiryDays: data.expiryDays ?? 14,
      });

      toast({
        title: "Invitation sent",
        description: `Jury invitation sent to ${data.email}`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send jury invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send jury invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Create Jury Invitation</SheetTitle>
          <SheetDescription>
            Send an invitation to a jury member to rate submissions. The link
            will contain a secure token valid for the specified period.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSendInvitation)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="jury-email">Jury Member Email</FormLabel>
                  <FormControl>
                    <Input
                      id="jury-email"
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="expiry">Expiry (days)</FormLabel>
                  <FormControl>
                    <Input
                      id="expiry"
                      type="number"
                      min="1"
                      max="90"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : parseInt(value, 10)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="displayName">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      id="displayName"
                      placeholder="Jury Member Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="notes">Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Additional instructions for the jury member"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <h3 className="font-medium">Filter Submissions</h3>
              <p className="text-sm text-muted-foreground">
                Optionally restrict which submissions this jury member will rate
              </p>

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="competitionClassId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="competition-class">
                        Competition Class
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="competition-class">
                            <SelectValue placeholder="All classes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {competitionClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deviceGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="device-group">Device Group</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="device-group">
                            <SelectValue placeholder="All devices" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deviceGroups.map((group) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                            >
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="topic">Topic</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="topic">
                            <SelectValue placeholder="All topics" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem
                              key={topic.id}
                              value={topic.id.toString()}
                            >
                              {`${topic.orderIndex + 1}. ${topic.name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <SheetFooter className="pt-4">
              <PrimaryButton type="submit" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Send Invitation"}
              </PrimaryButton>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
