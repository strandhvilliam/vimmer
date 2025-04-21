"use client";

import React from "react";
import { Label } from "@vimmer/ui/components/label";
import { Input } from "@vimmer/ui/components/input";
import RuleToggle from "./rule-toggle";
import { Rule, WithinTimerangeParams } from "../page";
import Link from "next/link";

interface WithinTimerangeRuleProps {
  withinTimerange: Rule<WithinTimerangeParams>;
}

export default function WithinTimerangeRule({
  withinTimerange,
}: WithinTimerangeRuleProps) {
  const [rule, setRule] = React.useState(withinTimerange);

  const updateRule = (field: "enabled" | "severity" | "params", value: any) => {
    setRule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  React.useEffect(() => {
    console.log("Within Timerange Rule updated:", rule);
  }, [rule]);

  return (
    <RuleToggle
      title="Within Time Range"
      description="Verify photos were taken during the specified competition timeframe using EXIF data."
      enabled={rule.enabled}
      onEnabledChange={(enabled) => updateRule("enabled", enabled)}
      severity={rule.severity}
      onSeverityChange={(severity) => updateRule("severity", severity)}
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
              value={rule.params.start?.slice(0, 16) || ""}
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
              value={rule.params.end?.slice(0, 16) || ""}
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
