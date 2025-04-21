"use client";

import React from "react";
import { Label } from "@vimmer/ui/components/label";
import { Input } from "@vimmer/ui/components/input";
import RuleToggle from "./rule-toggle";
import Link from "next/link";
import useRulesStore from "../_store/use-rules-store";

export default function WithinTimerangeRule() {
  const withinTimerange = useRulesStore((state) => state.within_timerange);
  const updateRule = useRulesStore((state) => state.updateRule);

  return (
    <RuleToggle
      title="Within Time Range"
      description="Verify photos were taken during the specified competition timeframe using EXIF data."
      enabled={withinTimerange.enabled}
      onEnabledChange={(enabled) =>
        updateRule("within_timerange", "enabled", enabled)
      }
      severity={withinTimerange.severity}
      onSeverityChange={(severity) =>
        updateRule("within_timerange", "severity", severity)
      }
      recommendedSeverity="error"
    >
      <div className="flex flex-col">
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg pointer-events-none">
          <div className="space-y-1.5">
            <Label htmlFor="startTime" className="text-xs font-medium">
              Competition Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={withinTimerange.params.start?.slice(0, 16) || ""}
              disabled
              className="text-sm text-foreground !opacity-100"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endTime" className="text-xs font-medium">
              Competition End Time
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={withinTimerange.params.end?.slice(0, 16) || ""}
              disabled
              className="text-sm text-foreground !opacity-100"
            />
          </div>
        </div>
        <div className="mt-1 flex justify-end">
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
