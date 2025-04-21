"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import useRulesStore from "../_store/use-rules-store";

export default function StrictTimestampOrderingRule() {
  const strictTimestampOrdering = useRulesStore(
    (state) => state.strict_timestamp_ordering
  );
  const updateRule = useRulesStore((state) => state.updateRule);

  return (
    <RuleToggle
      title="Strict Timestamp Ordering"
      description="Ensure photo timestamps align chronologically with the theme submission order."
      enabled={strictTimestampOrdering.enabled}
      onEnabledChange={(enabled) =>
        updateRule("strict_timestamp_ordering", "enabled", enabled)
      }
      severity={strictTimestampOrdering.severity}
      onSeverityChange={(severity) =>
        updateRule("strict_timestamp_ordering", "severity", severity)
      }
      recommendedSeverity="warning"
    />
  );
}
