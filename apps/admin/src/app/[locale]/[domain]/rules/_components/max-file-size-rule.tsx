"use client";

import React from "react";
import { Label } from "@vimmer/ui/components/label";
import { Slider } from "@vimmer/ui/components/slider";
import RuleToggle from "./rule-toggle";
import useRulesStore from "../_store/use-rules-store";

export default function MaxFileSizeRule() {
  const maxFileSize = useRulesStore((state) => state.max_file_size);
  const updateRule = useRulesStore((state) => state.updateRule);

  // Helper functions
  const getMbValue = (bytes: number) => Math.round(bytes / (1024 * 1024));

  return (
    <RuleToggle
      title="Maximum File Size"
      description="Set the largest allowed file size for individual photos."
      enabled={maxFileSize.enabled}
      onEnabledChange={(enabled) =>
        updateRule("max_file_size", "enabled", enabled)
      }
      severity={maxFileSize.severity}
      onSeverityChange={(severity) =>
        updateRule("max_file_size", "severity", severity)
      }
      recommendedSeverity="error"
    >
      <div className="space-y-4 max-w-md w-full">
        <div>
          <div className="mb-3 flex justify-between items-center">
            <Label htmlFor="maxFileSize" className="text-sm font-medium">
              Limit:{" "}
              <span className="text-primary font-semibold tabular-nums bg-muted px-2 py-1 rounded-md">
                {getMbValue(maxFileSize.params.maxBytes)} MB
              </span>
            </Label>
          </div>
          <Slider
            id="maxFileSize"
            min={1}
            max={100}
            step={1}
            value={[getMbValue(maxFileSize.params.maxBytes)]}
            onValueChange={(values) => {
              const value = values[0];
              if (typeof value === "number") {
                updateRule("max_file_size", "params", {
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
