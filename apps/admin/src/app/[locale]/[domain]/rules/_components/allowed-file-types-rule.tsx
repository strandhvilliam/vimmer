"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@vimmer/ui/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";
import RuleToggle from "./rule-toggle";
import useRulesStore from "../_store/use-rules-store";

const fileTypeOptions = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "tiff", label: "TIFF" },
  { value: "heic", label: "HEIC" },
];

export default function AllowedFileTypesRule() {
  const allowedFileTypes = useRulesStore((state) => state.allowed_file_types);
  const updateRule = useRulesStore((state) => state.updateRule);

  const toggleFileType = (fileType: string) => {
    const currentTypes = [...allowedFileTypes.params.allowedFileTypes];
    const index = currentTypes.indexOf(fileType);

    if (index > -1) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(fileType);
    }

    updateRule("allowed_file_types", "params", {
      allowedFileTypes: currentTypes,
    });
  };

  return (
    <RuleToggle
      title="Allowed File Types"
      description="Specify permitted image file formats (e.g., JPG, PNG)."
      enabled={allowedFileTypes.enabled}
      onEnabledChange={(enabled) =>
        updateRule("allowed_file_types", "enabled", enabled)
      }
      severity={allowedFileTypes.severity}
      onSeverityChange={(severity) =>
        updateRule("allowed_file_types", "severity", severity)
      }
      recommendedSeverity="error"
    >
      <div className="space-y-3 flex flex-col items-end">
        <div className="flex flex-wrap gap-2">
          {fileTypeOptions.map((option) => {
            const isSelected =
              allowedFileTypes.params.allowedFileTypes.includes(option.value);
            return (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => toggleFileType(option.value)}
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
                {isSelected && <CheckCircle className="h-4 w-4 opacity-80" />}
                {option.label}
              </motion.button>
            );
          })}
        </div>
        {allowedFileTypes.params.allowedFileTypes.length === 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 py-2 px-3 rounded-md border border-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Warning: No file types selected. Users won't be able to upload
            anything.
          </p>
        )}
      </div>
    </RuleToggle>
  );
}
