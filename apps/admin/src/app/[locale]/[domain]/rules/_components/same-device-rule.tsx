"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import { useFormContext } from "react-hook-form";
import { RulesFormValues } from "../_lib/schemas";

export default function SameDeviceRule() {
  const { control } = useFormContext<RulesFormValues>();

  return (
    <RuleToggle
      title="Same Device"
      description="Require all photos in a single submission to originate from the same camera/device."
      name="same_device"
      control={control}
      recommendedSeverity="warning"
    />
  );
}
