"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import { useFormContext } from "react-hook-form";
import { RulesFormValues } from "../_lib/schemas";

export default function StrictTimestampOrderingRule() {
  const { control } = useFormContext<RulesFormValues>();

  return (
    <RuleToggle
      title="Strict Timestamp Ordering"
      description="Ensure photo timestamps align chronologically with the theme submission order."
      name="strict_timestamp_ordering"
      control={control}
      recommendedSeverity="warning"
    />
  );
}
