"use client";

import React from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Save } from "lucide-react";
import { motion } from "motion/react";

export default function SaveRulesButton() {
  const handleSaveChanges = () => {
    console.log("Saving rules...");
  };

  return (
    <PrimaryButton
      onClick={handleSaveChanges}
      className="gap-2 w-full sm:w-auto flex-shrink-0"
    >
      <Save className="h-4 w-4" />
      Save Changes
    </PrimaryButton>
  );
}
