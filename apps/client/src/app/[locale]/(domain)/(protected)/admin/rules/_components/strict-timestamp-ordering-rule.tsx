"use client";

import React from "react";
import { RuleCard } from "./rule-card";
import { AnyFieldApi } from "@tanstack/react-form";

const title = "Strict Timestamp Ordering";
const description =
  "Ensure photo timestamps align chronologically with the theme submission order.";
const recommendedSeverity = "warning";

export default function StrictTimestampOrderingRule({
  field,
}: {
  field: AnyFieldApi;
}) {
  return (
    <RuleCard
      title={title}
      description={description}
      recommendedSeverity={recommendedSeverity}
      field={field}
    />
  );
}
