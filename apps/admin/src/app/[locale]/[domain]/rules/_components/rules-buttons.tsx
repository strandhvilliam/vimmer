// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { RefreshCcw, Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { RulesFormValues } from "../_lib/schemas";
import { saveRules } from "../_actions/save-rules";
import { useAction } from "next-safe-action/hooks";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Button } from "@vimmer/ui/components/button";

export function RulesButtons() {
  const { getValues, reset } = useFormContext<RulesFormValues>();
  const [isDirty, setIsDirty] = useQueryState("isDirty", parseAsBoolean);

  const { execute, isExecuting } = useAction(saveRules, {
    onSuccess: (data) => {
      toast.success("Rules saved successfully");
      const currentValues = getValues();
      reset(currentValues);
      setIsDirty(false);
    },
    onError: () => {
      toast.error("Failed to save rules");
    },
  });

  const handleSaveChanges = async () => {
    if (!isDirty) return;
    const formValues = getValues();
    execute(formValues);
  };

  const handleReset = () => {
    reset();
    setIsDirty(false);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={handleReset}>
        <RefreshCcw className="h-4 w-4" />
      </Button>
      <PrimaryButton
        onClick={handleSaveChanges}
        className="gap-2 w-full sm:w-auto flex-shrink-0"
        disabled={!isDirty || isExecuting}
      >
        <Save className="h-4 w-4" />
        {isExecuting ? "Saving..." : "Save Changes"}
      </PrimaryButton>
    </div>
  );
}
