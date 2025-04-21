"use client";

import React from "react";
import { Label } from "@vimmer/ui/components/label";
import { Slider } from "@vimmer/ui/components/slider";
import RuleToggle from "./rule-toggle";
import { useFormContext, Controller } from "react-hook-form";
import { RulesFormValues } from "../_types/update-rules-schema";

export default function MaxFileSizeRule() {
  const { control } = useFormContext<RulesFormValues>();

  const getMbValue = (bytes: number) => Math.round(bytes / (1024 * 1024));

  return (
    <RuleToggle
      title="Maximum File Size"
      description="Set the largest allowed file size for individual photos."
      name="max_file_size"
      control={control}
      recommendedSeverity="error"
    >
      <div className="space-y-4 max-w-md w-full">
        <div>
          <div className="mb-3 flex justify-between items-center">
            <Controller
              name="max_file_size.params.maxBytes"
              control={control}
              render={({ field }) => (
                <div className="space-y-4 flex flex-col items-start w-full">
                  <Label htmlFor="maxFileSize" className="text-sm font-medium">
                    Limit:{" "}
                    <span className="text-primary font-semibold tabular-nums bg-muted px-2 py-1 rounded-md">
                      {getMbValue(field.value)} MB
                    </span>
                  </Label>
                  <Slider
                    id="maxFileSize"
                    min={1}
                    max={100}
                    step={1}
                    value={[getMbValue(field.value)]}
                    onValueChange={(values) => {
                      const value = values[0];
                      if (typeof value === "number") {
                        field.onChange(value * 1024 * 1024);
                        field.onBlur();
                      }
                    }}
                    className="cursor-pointer"
                  />
                </div>
              )}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>1 MB</span>
            <span>100 MB</span>
          </div>
        </div>
      </div>
    </RuleToggle>
  );
}
