"use client";

import React from "react";
import { Label } from "@vimmer/ui/components/label";
import { Slider } from "@vimmer/ui/components/slider";
import RuleToggle from "./rule-toggle";
import { Rule, MaxFileSizeParams } from "../page";

interface MaxFileSizeRuleProps {
  maxFileSize: Rule<MaxFileSizeParams>;
}

export default function MaxFileSizeRule({ maxFileSize }: MaxFileSizeRuleProps) {
  const [rule, setRule] = React.useState(maxFileSize);

  // Helper functions
  const getMbValue = (bytes: number) => Math.round(bytes / (1024 * 1024));

  // Update rule handlers
  const updateRule = (field: "enabled" | "severity" | "params", value: any) => {
    setRule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update parent state when client state changes
  React.useEffect(() => {
    // You could add API calls or dispatch actions here to save the changes
    console.log("Max File Size Rule updated:", rule);
  }, [rule]);

  return (
    <RuleToggle
      title="Maximum File Size"
      description="Set the largest allowed file size for individual photos."
      enabled={rule.enabled}
      onEnabledChange={(enabled) => updateRule("enabled", enabled)}
      severity={rule.severity}
      onSeverityChange={(severity) => updateRule("severity", severity)}
      recommendedSeverity="error"
    >
      <div className="space-y-4 max-w-md w-full">
        <div>
          <div className="mb-3 flex justify-between items-center">
            <Label htmlFor="maxFileSize" className="text-sm font-medium">
              Limit:{" "}
              <span className="text-primary font-semibold tabular-nums bg-muted px-2 py-1 rounded-md">
                {getMbValue(rule.params.maxBytes)} MB
              </span>
            </Label>
          </div>
          <Slider
            id="maxFileSize"
            min={1}
            max={100}
            step={1}
            value={[getMbValue(rule.params.maxBytes)]}
            onValueChange={(values) => {
              const value = values[0];
              if (typeof value === "number") {
                updateRule("params", {
                  maxBytes: value * 1024 * 1024,
                });
              }
            }}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>1 MB</span>
            <span>100 MB</span>
          </div>
        </div>
      </div>
    </RuleToggle>
  );
}
