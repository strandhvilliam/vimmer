"use client";

import React, { useState } from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Save } from "lucide-react";
import { motion } from "motion/react";
import { useFormContext } from "react-hook-form";
import { saveRules } from "../_actions/save-rules";
import { toast } from "sonner";
import { RulesFormValues } from "../_store/use-rules-form";

export default function SaveRulesButton() {
  const [isSaving, setIsSaving] = useState(false);
  const { formState, getValues } = useFormContext<RulesFormValues>();
  const { isDirty } = formState;

  const handleSaveChanges = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      const formValues = getValues();
      const result = await saveRules(formValues);

      if (result.success) {
        toast.success("Rules saved successfully");
      } else {
        toast.error(result.message || "Failed to save rules");
      }
    } catch (error) {
      console.error("Error saving rules:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PrimaryButton
      onClick={handleSaveChanges}
      className="gap-2 w-full sm:w-auto flex-shrink-0"
      disabled={!isDirty || isSaving}
    >
      <Save className="h-4 w-4" />
      {isSaving ? "Saving..." : "Save Changes"}
    </PrimaryButton>
  );
}
