"use client";

import React, { useState } from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Save } from "lucide-react";
import { motion } from "motion/react";
import useRulesStore from "../_store/use-rules-store";
import { saveRules } from "../_actions/save-rules";
import { toast } from "sonner";

export default function SaveRulesButton() {
  const [isSaving, setIsSaving] = useState(false);
  const rules = useRulesStore();
  const resetDirty = useRulesStore((state) => state.resetDirty);
  const isDirty = useRulesStore((state) => state.isDirty);

  const handleSaveChanges = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      const {
        isDirty,
        initializeRules,
        updateRule,
        resetDirty: _,
        ...rulesData
      } = rules;

      const result = await saveRules(rulesData);

      if (result.success) {
        toast.success("Rules saved successfully");
        resetDirty();
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
