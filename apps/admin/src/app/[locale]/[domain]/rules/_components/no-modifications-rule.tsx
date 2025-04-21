"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import useRulesStore from "../_store/use-rules-store";

export default function NoModificationsRule() {
  const modified = useRulesStore((state) => state.modified);
  const updateRule = useRulesStore((state) => state.updateRule);

  return (
    <RuleToggle
      title="No Digital Modifications"
      description="Detect if photos show signs of editing in software like Photoshop, Lightroom, etc."
      enabled={modified.enabled}
      onEnabledChange={(enabled) => updateRule("modified", "enabled", enabled)}
      severity={modified.severity}
      onSeverityChange={(severity) =>
        updateRule("modified", "severity", severity)
      }
      recommendedSeverity="warning"
    />
  );
}
