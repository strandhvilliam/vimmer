"use client";

import React from "react";
import { Label } from "@vimmer/ui/components/label";
import { Input } from "@vimmer/ui/components/input";
import RuleToggle from "./rule-toggle";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { RulesFormValues } from "../_types/update-rules-schema";

export default function WithinTimerangeRule() {
  const { control, watch } = useFormContext<RulesFormValues>();
  const withinTimerange = watch("within_timerange");

  return (
    <RuleToggle
      title="Within Time Range"
      description="Verify photos were taken during the specified competition timeframe using EXIF data."
      name="within_timerange"
      control={control}
      recommendedSeverity="error"
    >
      <div className="flex flex-col">
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg pointer-events-none">
          <div className="space-y-1.5">
            <div className="text-xs font-medium">Competition Start Time</div>
            <div className="text-sm text-foreground">
              {withinTimerange.params.start?.slice(0, 16) || ""}
            </div>
          </div>
          <div className="space-y-1.5 border-l border-border pl-4">
            <div className="text-xs font-medium">Competition End Time</div>
            <div className="text-sm text-foreground">
              {withinTimerange.params.end?.slice(0, 16) || ""}
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
    </RuleToggle>
  );
}
