import React from "react";
import MaxFileSizeRule from "./_components/max-file-size-rule";
import AllowedFileTypesRule from "./_components/allowed-file-types-rule";
import WithinTimerangeRule from "./_components/within-timerange-rule";
import SameDeviceRule from "./_components/same-device-rule";
import NoModificationsRule from "./_components/no-modifications-rule";
import { RulesButtons } from "./_components/rules-buttons";
import StrictTimestampOrderingRule from "./_components/strict-timestamp-ordering-rule";
import { RulesProvider } from "./_components/rules-provider";
import { RulesFormValues } from "./_types/update-rules-schema";

async function fetchRules(): Promise<RulesFormValues> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    max_file_size: {
      enabled: true,
      severity: "error",
      params: {
        maxBytes: 25 * 1024 * 1024, // 25MB
      },
    },
    allowed_file_types: {
      enabled: true,
      severity: "error",
      params: {
        allowedFileTypes: ["jpg", "png"],
      },
    },
    strict_timestamp_ordering: {
      enabled: false,
      severity: "warning",
      params: null,
    },
    same_device: {
      enabled: false,
      severity: "warning",
      params: null,
    },
    within_timerange: {
      enabled: true,
      severity: "error",
      params: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
      },
    },
    modified: {
      enabled: false,
      severity: "warning",
      params: null,
    },
  };
}

export default async function RulesPage() {
  const initialRules = await fetchRules();

  return (
    <RulesProvider initialRules={initialRules}>
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
          <RulesButtons />
        </div>
        <div className="space-y-4">
          <MaxFileSizeRule />
          <AllowedFileTypesRule />
          <WithinTimerangeRule />
          <SameDeviceRule />
          <NoModificationsRule />
          <StrictTimestampOrderingRule />
        </div>
      </div>
    </RulesProvider>
  );
}
