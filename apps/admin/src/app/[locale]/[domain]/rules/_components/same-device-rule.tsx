"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import { Rule, EmptyParams } from "../page";

interface SameDeviceRuleProps {
  sameDevice: Rule<EmptyParams>;
}

export default function SameDeviceRule({ sameDevice }: SameDeviceRuleProps) {
  const [rule, setRule] = React.useState(sameDevice);

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
    console.log("Same Device Rule updated:", rule);
  }, [rule]);

  return (
    <RuleToggle
      title="Same Device"
      description="Require all photos in a single submission to originate from the same camera/device."
      enabled={rule.enabled}
      onEnabledChange={(enabled) => updateRule("enabled", enabled)}
      severity={rule.severity}
      onSeverityChange={(severity) => updateRule("severity", severity)}
      recommendedSeverity="warning"
    />
  );
}
