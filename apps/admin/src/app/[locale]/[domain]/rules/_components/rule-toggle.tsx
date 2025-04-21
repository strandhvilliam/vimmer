"use client";

import React from "react";
import { Switch } from "@vimmer/ui/components/switch";
import { Card } from "@vimmer/ui/components/card";
import { motion } from "motion/react";
import { SeverityLevel } from "@vimmer/validation/types";
import { SeverityToggle } from "./severity-toggle";
import { Control, Controller, UseControllerProps } from "react-hook-form";
import { RulesFormValues } from "../_lib/schemas";

interface RuleToggleProps {
  title: string;
  description: string;
  name: keyof RulesFormValues;
  control: Control<RulesFormValues>;
  recommendedSeverity: SeverityLevel;
  children?: React.ReactNode;
}

export default function RuleToggle({
  title,
  description,
  name,
  control,
  recommendedSeverity,
  children,
}: RuleToggleProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-medium" id={`${title}-heading`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0 self-center ml-4">
          <Controller
            name={`${name}.enabled` as any}
            control={control}
            render={({ field }) => (
              <Switch
                id={title}
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  field.onBlur(); // Explicitly mark as touched
                }}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                aria-labelledby={`${title}-heading`}
              />
            )}
          />
        </div>
      </div>

      <Controller
        name={`${name}.enabled` as any}
        control={control}
        render={({ field }) =>
          field.value && (
            <motion.div
              key="content"
              initial={{ opacity: 0.5, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-between items-center"
            >
              <Controller
                name={`${name}.severity` as any}
                control={control}
                render={({ field: severityField }) => (
                  <SeverityToggle
                    severity={severityField.value}
                    onSeverityChange={(severity) => {
                      severityField.onChange(severity);
                      severityField.onBlur(); // Explicitly mark as touched
                    }}
                    recommendedSeverity={recommendedSeverity}
                  />
                )}
              />
              {children}
            </motion.div>
          )
        }
      />
    </Card>
  );
}
