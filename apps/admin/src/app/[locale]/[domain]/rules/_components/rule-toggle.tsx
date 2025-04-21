"use client";

import React from "react";
import { Switch } from "@vimmer/ui/components/switch";
import { Label } from "@vimmer/ui/components/label";
import { cn } from "@vimmer/ui/lib/utils";
import { CheckCircle, AlertCircle, InfoIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SeverityLevel } from "@vimmer/validation";
import { Card } from "@vimmer/ui/components/card";
import { SeverityToggle } from "./severity-toggle";

interface RuleToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  severity: SeverityLevel;
  onSeverityChange: (severity: SeverityLevel) => void;
  recommendedSeverity: SeverityLevel;
  children?: React.ReactNode;
}

export default function RuleToggle({
  title,
  description,
  enabled,
  onEnabledChange,
  severity,
  onSeverityChange,
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
          <Switch
            id={title}
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            aria-labelledby={`${title}-heading`}
          />
        </div>
      </div>

      {enabled && (
        <motion.div
          key="content"
          initial={{ opacity: 0.5, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-between items-center"
        >
          <SeverityToggle
            severity={severity}
            onSeverityChange={onSeverityChange}
            recommendedSeverity={recommendedSeverity}
          />
          {children}
        </motion.div>
      )}
    </Card>
  );
}
