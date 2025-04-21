import React from "react";
import MaxFileSizeRule from "./_components/max-file-size-rule";
import AllowedFileTypesRule from "./_components/allowed-file-types-rule";
import WithinTimerangeRule from "./_components/within-timerange-rule";
import SameDeviceRule from "./_components/same-device-rule";
import NoModificationsRule from "./_components/no-modifications-rule";
import SaveRulesButton from "./_components/save-rules-button";
import { SeverityLevel } from "@vimmer/validation";

export interface MaxFileSizeParams {
  maxBytes: number;
}

export interface AllowedFileTypesParams {
  allowedFileTypes: string[];
}

export interface WithinTimerangeParams {
  start: string;
  end: string;
}

export interface EmptyParams {}

export interface Rule<T> {
  enabled: boolean;
  severity: SeverityLevel;
  params: T;
}

export interface RulesState {
  max_file_size: Rule<MaxFileSizeParams>;
  allowed_file_types: Rule<AllowedFileTypesParams>;
  strict_timestamp_ordering: Rule<EmptyParams>;
  same_device: Rule<EmptyParams>;
  within_timerange: Rule<WithinTimerangeParams>;
  modified: Rule<EmptyParams>;
}

async function fetchRules(): Promise<RulesState> {
  await new Promise((resolve) => setTimeout(resolve, 100));

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
        allowedFileTypes: ["image/jpeg", "image/png"],
      },
    },
    strict_timestamp_ordering: {
      enabled: false,
      severity: "warning",
      params: {},
    },
    same_device: {
      enabled: false,
      severity: "warning",
      params: {},
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
      params: {},
    },
  };
}

export default async function RulesPage() {
  const rules = await fetchRules();

  return (
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
        <SaveRulesButton />
      </div>

      <div className="space-y-4">
        <MaxFileSizeRule maxFileSize={rules.max_file_size} />
        <AllowedFileTypesRule allowedFileTypes={rules.allowed_file_types} />
        <WithinTimerangeRule withinTimerange={rules.within_timerange} />
        <SameDeviceRule sameDevice={rules.same_device} />
        <NoModificationsRule modified={rules.modified} />
      </div>
    </div>
  );
}
