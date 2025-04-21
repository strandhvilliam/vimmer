"use client";

import React from "react";
import { FormProvider } from "react-hook-form";
import { useRulesForm, RulesFormValues } from "../_store/use-rules-form";

interface RulesProviderProps {
  initialRules: RulesFormValues;
  children: React.ReactNode;
}

export function RulesProvider({ initialRules, children }: RulesProviderProps) {
  const methods = useRulesForm(initialRules);

  return <FormProvider {...methods}>{children}</FormProvider>;
}
