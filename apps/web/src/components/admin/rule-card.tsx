"use client";
"use no memo";

import React from "react";
import { Card } from "@vimmer/ui/components/card";
import { motion } from "motion/react";
import { AnyFieldApi } from "@tanstack/react-form";
import { RulesSeverityToggle } from "./rules-severity-toggle";
import { Switch } from "@vimmer/ui/components/switch";
import { SeverityLevel } from "../../../../../packages/validation/old/types";

interface RuleCardProps {
  title: string;
  description: string;
  recommendedSeverity: SeverityLevel;
  field: AnyFieldApi;
  children?: React.ReactNode;
}

export function RuleCard({
  title,
  description,
  recommendedSeverity,
  field,
  children,
}: RuleCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0 self-center ml-4">
          <Switch
            id={title}
            checked={field.state.value.enabled}
            onCheckedChange={(checked) => {
              field.handleChange({ ...field.state.value, enabled: checked });
            }}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            aria-labelledby={`${title}-heading`}
          />
        </div>
      </div>

      {field.state.value.enabled && (
        <motion.div
          key="content"
          initial={{ opacity: 0.5, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-between items-center"
        >
          <RulesSeverityToggle
            severity={field.state.value.severity}
            onSeverityChange={(severity) => {
              field.handleChange({ ...field.state.value, severity });
            }}
            recommendedSeverity={recommendedSeverity}
          />
          {children}
        </motion.div>
      )}
    </Card>
  );
}
