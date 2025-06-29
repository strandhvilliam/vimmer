// @ts-nocheck
"use client";

import React from "react";
import RuleToggle from "./rule-toggle";
import { useFormContext } from "react-hook-form";
import { RulesFormValues } from "../_lib/schemas";

export default function NoModificationsRule() {
  const { control } = useFormContext<RulesFormValues>();

  return (
    <RuleToggle
      title="No Digital Modifications"
      description="Detect if photos show signs of editing in software like Photoshop, Lightroom, etc."
      name="modified"
      control={control}
      recommendedSeverity="warning"
    />
  );
}
