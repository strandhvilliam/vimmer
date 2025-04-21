"use client";

import React, { useEffect } from "react";
import useRulesStore from "../_store/use-rules-store";
import { RulesState } from "../_store/use-rules-store";

interface RulesProviderProps {
  initialRules: Omit<RulesState, "isDirty">;
  children: React.ReactNode;
}

export function RulesProvider({ initialRules, children }: RulesProviderProps) {
  const initializeRules = useRulesStore((state) => state.initializeRules);

  useEffect(() => {
    initializeRules(initialRules);
  }, [initialRules, initializeRules]);

  return <>{children}</>;
}
