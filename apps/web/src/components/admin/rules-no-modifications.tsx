"use client";

import React from "react";
import { RuleCard } from "./rule-card";
import { AnyFieldApi } from "@tanstack/react-form";

const title = "No Digital Modifications";
const description =
  "Detect if photos show signs of editing in software like Photoshop, Lightroom, etc.";
const recommendedSeverity = "warning";

export function RulesNoModifications({ field }: { field: AnyFieldApi }) {
  return (
    <RuleCard
      title={title}
      description={description}
      recommendedSeverity={recommendedSeverity}
      field={field}
    />
  );
}
