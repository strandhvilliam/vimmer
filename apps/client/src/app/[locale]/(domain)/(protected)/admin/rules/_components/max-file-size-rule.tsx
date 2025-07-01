"use client";

import React from "react";
import { RuleCard } from "./rule-card";
import { AnyFieldApi } from "@tanstack/react-form";
import { Label } from "@vimmer/ui/components/label";
import { Slider } from "@vimmer/ui/components/slider";

const title = "Maximum File Size";
const description = "Set the largest allowed file size for individual photos.";
const recommendedSeverity = "error";

export default function MaxFileSizeRule({ field }: { field: AnyFieldApi }) {
  const getMbValue = (bytes: number) => Math.round(bytes / (1024 * 1024));

  return (
    <RuleCard
      title={title}
      description={description}
      recommendedSeverity={recommendedSeverity}
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
