"use client";

"use no memo";
import React from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { mapRulesToDbRules, parseRules } from "./parserules";
import { useForm } from "@tanstack/react-form";
import { useTRPC } from "@/trpc/client";
import { Button } from "@vimmer/ui/components/button";
import { RefreshCcw, Save, AlertCircle, CheckCircle } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";
import { RuleCard } from "./_components/rule-card";
import { Label } from "@vimmer/ui/components/label";
import { Slider } from "@vimmer/ui/components/slider";
import { motion } from "motion/react";
import { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@vimmer/ui/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

// Rule component definitions
function MaxFileSizeRule({ field }: { field: AnyFieldApi }) {
  const getMbValue = (bytes: number) => Math.round(bytes / (1024 * 1024));

  return (
    <RuleCard
      title="Maximum File Size"
      description="Set the largest allowed file size for individual photos."
      recommendedSeverity="error"
      field={field}
    >
      <div className="space-y-4 max-w-md w-full">
        <div>
          <div className="mb-3 flex justify-between items-center">
            <div className="space-y-4 flex flex-col items-start w-full">
              <Label htmlFor="maxFileSize" className="text-sm font-medium">
                Limit:{" "}
                <span className="text-primary font-semibold tabular-nums bg-muted px-2 py-1 rounded-md">
                  {getMbValue(field.state.value.params.maxBytes)} MB
                </span>
              </Label>
              <Slider
                id="maxFileSize"
                min={1}
                max={100}
                step={1}
                value={[getMbValue(field.state.value.params.maxBytes)]}
                onValueChange={(values) => {
                  const value = values[0];
                  if (typeof value === "number") {
                    field.handleChange({
                      ...field.state.value,
                      params: {
                        ...field.state.value.params,
                        maxBytes: value * 1024 * 1024,
                      },
                    });
                    field.handleBlur();
                  }
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>1 MB</span>
            <span>100 MB</span>
          </div>
        </div>
      </div>
    </RuleCard>
  );
}

function AllowedFileTypesRule({ field }: { field: AnyFieldApi }) {
  const FILE_TYPE_OPTIONS = [
    { value: "jpg", label: "JPG" },
    { value: "png", label: "PNG" },
  ];

  return (
    <RuleCard
      title="Allowed File Types"
      description="Specify permitted image file formats (e.g., JPG, PNG)."
      recommendedSeverity="error"
      field={field}
    >
      <div className="space-y-3 flex flex-col items-end">
        <div className="flex flex-wrap gap-2">
          {FILE_TYPE_OPTIONS.map((option) => {
            const isSelected =
              field.state.value.params.allowedFileTypes.includes(option.value);
            return (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => {
                  const currentTypes = [
                    ...field.state.value.params.allowedFileTypes,
                  ];
                  const index = currentTypes.indexOf(option.value);

                  if (index > -1) {
                    currentTypes.splice(index, 1);
                  } else {
                    currentTypes.push(option.value);
                  }
                  field.handleChange({
                    ...field.state.value,
                    params: {
                      ...field.state.value.params,
                      allowedFileTypes: currentTypes,
                    },
                  });
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  "border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                  isSelected
                    ? "bg-primary text-primary-foreground border-transparent shadow-sm hover:bg-primary/90"
                    : "bg-secondary/60 hover:bg-secondary text-secondary-foreground border-border/50"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSelected && <CheckCircle className="h-4 w-4 opacity-80" />}
                {option.label}
              </motion.button>
            );
          })}
        </div>
        {field.state.value.params.allowedFileTypes.length === 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 py-2 px-3 rounded-md border border-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Warning: No file types selected. Users won't be able to upload
            anything.
          </p>
        )}
      </div>
    </RuleCard>
  );
}

function WithinTimerangeRule({ field }: { field: AnyFieldApi }) {
  const hasTimeStart = field.state.value.params?.start !== "";
  const hasTimeEnd = field.state.value.params?.end !== "";

  return (
    <RuleCard
      title="Within Time Range"
      description="Verify photos were taken during the specified competition timeframe using EXIF data."
      recommendedSeverity="error"
      field={field}
    >
      <div className="flex flex-col">
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg pointer-events-none">
          <div className="space-y-1.5">
            <div className="text-xs font-medium">Competition Start Time</div>
            <div className="text-sm text-foreground">
              {hasTimeStart && field.state.value.params?.start
                ? format(field.state.value.params.start, "yyyy-MM-dd HH:mm")
                : "Not set"}
            </div>
          </div>
          <div className="space-y-1.5 border-l border-border pl-4">
            <div className="text-xs font-medium">Competition End Time</div>
            <div className="text-sm text-foreground">
              {hasTimeEnd && field.state.value.params?.end
                ? format(field.state.value.params.end, "yyyy-MM-dd HH:mm")
                : "Not set"}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <span className="text-xs text-muted-foreground">
            You can configure the start and end time on the
          </span>
          <Link
            href="../settings"
            className="text-xs text-blue-600 underline hover:text-blue-700"
          >
            <span className="ml-1 underline">settings page</span>
          </Link>
        </div>
      </div>
    </RuleCard>
  );
}

function SameDeviceRule({ field }: { field: AnyFieldApi }) {
  return (
    <RuleCard
      title="Same Device"
      description="Require all photos in a single submission to originate from the same camera/device."
      recommendedSeverity="warning"
      field={field}
    />
  );
}

function NoModificationsRule({ field }: { field: AnyFieldApi }) {
  return (
    <RuleCard
      title="No Digital Modifications"
      description="Detect if photos show signs of editing in software like Photoshop, Lightroom, etc."
      recommendedSeverity="warning"
      field={field}
    />
  );
}

function StrictTimestampOrderingRule({ field }: { field: AnyFieldApi }) {
  return (
    <RuleCard
      title="Strict Timestamp Ordering"
      description="Ensure photo timestamps align chronologically with the theme submission order."
      recommendedSeverity="warning"
      field={field}
    />
  );
}

export function RulesClientPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();
  const { data: dbRules } = useSuspenseQuery(
    trpc.rules.getByDomain.queryOptions({
      domain,
    })
  );
  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    })
  );

  const { mutate: updateRules } = useMutation(
    trpc.rules.updateMultiple.mutationOptions({
      onSuccess: () => {
        toast.success("Rules updated successfully");
      },
      onError: () => {
        toast.error("Failed to update rules");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.rules.pathKey(),
        });
      },
    })
  );

  const rules = parseRules(dbRules, {
    startDate: marathon.startDate ?? undefined,
    endDate: marathon.endDate ?? undefined,
  });

  const form = useForm({
    defaultValues: rules,
    onSubmit: ({ value }) => {
      updateRules({
        domain,
        data: mapRulesToDbRules(value, marathon.id),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-rocgrotesk">
              Rules
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Configure validation rules for photo submissions.
            </p>
          </div>
          <form.Subscribe
            selector={(state) => ({
              isSubmitting: state.isSubmitting,
              isDirty: state.isDirty,
            })}
          >
            {({ isSubmitting, isDirty }) => (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => form.reset()}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <PrimaryButton
                  type="submit"
                  className="gap-2 w-full sm:w-auto flex-shrink-0"
                  disabled={!isDirty || isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </PrimaryButton>
              </div>
            )}
          </form.Subscribe>
        </div>
        <div className="space-y-4">
          <form.Field name="max_file_size">
            {(field) => <MaxFileSizeRule field={field} />}
          </form.Field>
          <form.Field name="allowed_file_types">
            {(field) => <AllowedFileTypesRule field={field} />}
          </form.Field>
          <form.Field name="within_timerange">
            {(field) => <WithinTimerangeRule field={field} />}
          </form.Field>
          <form.Field name="same_device">
            {(field) => <SameDeviceRule field={field} />}
          </form.Field>
          <form.Field name="modified">
            {(field) => <NoModificationsRule field={field} />}
          </form.Field>
          <form.Field name="strict_timestamp_ordering">
            {(field) => <StrictTimestampOrderingRule field={field} />}
          </form.Field>
        </div>
      </div>
    </form>
  );
}
