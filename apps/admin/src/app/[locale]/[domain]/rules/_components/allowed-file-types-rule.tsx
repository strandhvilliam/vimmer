"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@vimmer/ui/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";
import RuleToggle from "./rule-toggle";
import { Controller, useFormContext } from "react-hook-form";
import { RulesFormValues } from "../_types/update-rules-schema";

const fileTypeOptions = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "tiff", label: "TIFF" },
  { value: "heic", label: "HEIC" },
];

export default function AllowedFileTypesRule() {
  const { control } = useFormContext<RulesFormValues>();

  return (
    <RuleToggle
      title="Allowed File Types"
      description="Specify permitted image file formats (e.g., JPG, PNG)."
      name="allowed_file_types"
      control={control}
      recommendedSeverity="error"
    >
      <Controller
        name="allowed_file_types.params.allowedFileTypes"
        control={control}
        render={({ field }) => (
          <div className="space-y-3 flex flex-col items-end">
            <div className="flex flex-wrap gap-2">
              {fileTypeOptions.map((option) => {
                const isSelected = field.value.includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const currentTypes = [...field.value];
                      const index = currentTypes.indexOf(option.value);

                      if (index > -1) {
                        currentTypes.splice(index, 1);
                      } else {
                        currentTypes.push(option.value);
                      }
                      field.onChange(currentTypes);
                      field.onBlur();
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium",
                      "border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                      isSelected
                        ? "bg-primary text-primary-foreground border-transparent shadow-sm hover:bg-primary/90"
                        : "bg-secondary/60 hover:bg-secondary text-secondary-foreground border-border/50"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 opacity-80" />
                    )}
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
            {field.value.length === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 py-2 px-3 rounded-md border border-amber-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Warning: No file types selected. Users won't be able to upload
                anything.
              </p>
            )}
          </div>
        )}
      />
    </RuleToggle>
  );
}
