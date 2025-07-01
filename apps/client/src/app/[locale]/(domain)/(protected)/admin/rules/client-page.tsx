"use client";

import React from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { mapRulesToDbRules, parseRules } from "./parserules";
import { useForm } from "@tanstack/react-form";
import MaxFileSizeRule from "./_components/max-file-size-rule";
import AllowedFileTypesRule from "./_components/allowed-file-types-rule";
import WithinTimerangeRule from "./_components/within-timerange-rule";
import SameDeviceRule from "./_components/same-device-rule";
import NoModificationsRule from "./_components/no-modifications-rule";
import StrictTimestampOrderingRule from "./_components/strict-timestamp-ordering-rule";
import { useTRPC } from "@/trpc/client";
import { Button } from "@vimmer/ui/components/button";
import { RefreshCcw, Save } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";

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
