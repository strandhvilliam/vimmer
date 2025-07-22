"use client";

import React from "react";
import { RuleCard } from "./rule-card";
import { AnyFieldApi } from "@tanstack/react-form";

const title = "Same Device";
const description =
  "Require all photos in a single submission to originate from the same camera/device.";
const recommendedSeverity = "warning";

export function RulesSameDevice({ field }: { field: AnyFieldApi }) {
  return (
    <RuleCard
      title={title}
      description={description}
      recommendedSeverity={recommendedSeverity}
      field={field}
    />
  );
}
