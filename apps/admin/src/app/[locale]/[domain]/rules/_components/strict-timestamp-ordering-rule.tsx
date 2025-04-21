"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import { Rule, EmptyParams } from "../page";

interface StrictTimestampOrderingRuleProps {
  strictTimestampOrdering: Rule<EmptyParams>;
}

export default function StrictTimestampOrderingRule({
  strictTimestampOrdering,
}: StrictTimestampOrderingRuleProps) {
  const [rule, setRule] = React.useState(strictTimestampOrdering);

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
    console.log("Strict Timestamp Ordering Rule updated:", rule);
  }, [rule]);

  return (
    <RuleToggle
      title="Strict Timestamp Ordering"
      description="Ensure photo timestamps align chronologically with the theme submission order."
      enabled={rule.enabled}
      onEnabledChange={(enabled) => updateRule("enabled", enabled)}
      severity={rule.severity}
      onSeverityChange={(severity) => updateRule("severity", severity)}
      recommendedSeverity="warning"
    />
  );
}
