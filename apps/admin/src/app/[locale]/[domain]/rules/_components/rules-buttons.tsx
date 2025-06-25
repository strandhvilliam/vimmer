// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { RefreshCcw, Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { RulesFormValues } from "../_lib/schemas";
import { saveRules } from "../_actions/save-rules";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@vimmer/ui/components/button";

export function RulesButtons({
  initialRules,
}: {
  initialRules: RulesFormValues;
}) {
  const { getValues, reset, watch } = useFormContext<RulesFormValues>();
  const [isDirty, setIsDirty] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { execute, isExecuting } = useAction(saveRules, {
    onSuccess: () => {
      toast.success("Rules saved successfully");
      const currentValues = getValues();
      reset(currentValues);
    },
    onError: () => {
      toast.error("Failed to save rules");
    },
  });

  watch(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const isDirtyValue =
        JSON.stringify(getValues()) !== JSON.stringify(initialRules);
      setIsDirty(isDirtyValue);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  });

  const handleSaveChanges = async () => {
    if (!isDirty) return;
    const formValues = getValues();
    execute(formValues);
  };

  const handleReset = () => {
    reset();
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
