// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { RulesFormValues } from "../_types/update-rules-schema";
import { parseAsBoolean, useQueryState } from "nuqs";
interface RulesProviderProps {
  initialRules: RulesFormValues;
  children: React.ReactNode;
}

export function RulesProvider({ initialRules, children }: RulesProviderProps) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<RulesFormValues>({
    defaultValues: initialRules,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
