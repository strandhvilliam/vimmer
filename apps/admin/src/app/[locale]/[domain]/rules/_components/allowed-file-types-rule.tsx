"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@vimmer/ui/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";
import RuleToggle from "./rule-toggle";
import { Rule, AllowedFileTypesParams } from "../page";

// File type options
const fileTypeOptions = [
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/tiff", label: "TIFF" },
  { value: "image/heic", label: "HEIC" },
];

interface AllowedFileTypesRuleProps {
  allowedFileTypes: Rule<AllowedFileTypesParams>;
}

export default function AllowedFileTypesRule({
  allowedFileTypes,
}: AllowedFileTypesRuleProps) {
  const [rule, setRule] = React.useState(allowedFileTypes);

  // Update rule handlers
  const updateRule = (field: "enabled" | "severity" | "params", value: any) => {
    setRule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleFileType = (fileType: string) => {
    const currentTypes = [...rule.params.allowedFileTypes];
    const index = currentTypes.indexOf(fileType);

    if (index > -1) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(fileType);
    }

    updateRule("params", {
      allowedFileTypes: currentTypes,
    });
  };

  // Update parent state when client state changes
  React.useEffect(() => {
    // You could add API calls or dispatch actions here to save the changes
    console.log("Allowed File Types Rule updated:", rule);
  }, [rule]);

  return (
    <RuleToggle
      title="Allowed File Types"
      description="Specify permitted image file formats (e.g., JPG, PNG)."
      enabled={rule.enabled}
      onEnabledChange={(enabled) => updateRule("enabled", enabled)}
      severity={rule.severity}
      onSeverityChange={(severity) => updateRule("severity", severity)}
      recommendedSeverity="error"
    >
      <div className="space-y-3 flex flex-col items-end">
        <div className="flex flex-wrap gap-2">
          {fileTypeOptions.map((option) => {
            const isSelected = rule.params.allowedFileTypes.includes(
              option.value
            );
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
        {rule.params.allowedFileTypes.length === 0 && (
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
