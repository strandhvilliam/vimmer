"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import useRulesStore from "../_store/use-rules-store";

export default function SameDeviceRule() {
  const sameDevice = useRulesStore((state) => state.same_device);
  const updateRule = useRulesStore((state) => state.updateRule);

  return (
    <RuleToggle
      title="Same Device"
      description="Require all photos in a single submission to originate from the same camera/device."
      enabled={sameDevice.enabled}
      onEnabledChange={(enabled) =>
        updateRule("same_device", "enabled", enabled)
      }
      severity={sameDevice.severity}
      onSeverityChange={(severity) =>
        updateRule("same_device", "severity", severity)
      }
      recommendedSeverity="warning"
    />
  );
}
