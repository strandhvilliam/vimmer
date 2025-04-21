"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import { Rule, EmptyParams } from "../page";

interface NoModificationsRuleProps {
  modified: Rule<EmptyParams>;
}

export default function NoModificationsRule({
  modified,
}: NoModificationsRuleProps) {
  const [rule, setRule] = React.useState(modified);

  // Update rule handler
  const updateRule = (field: "enabled" | "severity", value: any) => {
    setRule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update parent state when client state changes
  React.useEffect(() => {
    // You could add API calls or dispatch actions here to save the changes
    console.log("No Modifications Rule updated:", rule);
  }, [rule]);

  return (
    <RuleToggle
      title="No Digital Modifications"
      description="Detect if photos show signs of editing in software like Photoshop, Lightroom, etc."
      enabled={rule.enabled}
      onEnabledChange={(enabled) => updateRule("enabled", enabled)}
      severity={rule.severity}
      onSeverityChange={(severity) => updateRule("severity", severity)}
      recommendedSeverity="warning"
    />
  );
}
