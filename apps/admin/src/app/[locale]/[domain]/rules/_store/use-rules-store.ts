import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SeverityLevel } from "@vimmer/validation";

export interface MaxFileSizeParams {
  maxBytes: number;
}

export interface AllowedFileTypesParams {
  allowedFileTypes: string[];
}

export interface WithinTimerangeParams {
  start: string;
  end: string;
}

export interface EmptyParams {}

export interface Rule<T> {
  enabled: boolean;
  severity: SeverityLevel;
  params: T;
}

export interface RulesState {
  max_file_size: Rule<MaxFileSizeParams>;
  allowed_file_types: Rule<AllowedFileTypesParams>;
  strict_timestamp_ordering: Rule<EmptyParams>;
  same_device: Rule<EmptyParams>;
  within_timerange: Rule<WithinTimerangeParams>;
  modified: Rule<EmptyParams>;
  isDirty: boolean;
}

interface RulesStore extends RulesState {
  initializeRules: (rules: Omit<RulesState, "isDirty">) => void;
  updateRule: <K extends keyof Omit<RulesState, "isDirty">>(
    ruleKey: K,
    field: "enabled" | "severity" | "params",
    value: any
  ) => void;
  resetDirty: () => void;
}

const initialRules: Omit<RulesState, "isDirty"> = {
  max_file_size: {
    enabled: false,
    severity: "error",
    params: { maxBytes: 0 },
  },
  allowed_file_types: {
    enabled: false,
    severity: "error",
    params: { allowedFileTypes: [] },
  },
  strict_timestamp_ordering: {
    enabled: false,
    severity: "warning",
    params: {},
  },
  same_device: {
    enabled: false,
    severity: "warning",
    params: {},
  },
  within_timerange: {
    enabled: false,
    severity: "error",
    params: { start: "", end: "" },
  },
  modified: {
    enabled: false,
    severity: "warning",
    params: {},
  },
};

const useRulesStore = create(
  persist<RulesStore>(
    (set) => ({
      ...initialRules,
      isDirty: false,
      initializeRules: (rules) => set({ ...rules, isDirty: false }),
      updateRule: (ruleKey, field, value) =>
        set((state) => ({
          [ruleKey]: {
            ...state[ruleKey],
            [field]: value,
          },
          isDirty: true,
        })),
      resetDirty: () => set({ isDirty: false }),
    }),
    {
      name: "rules-store-storage",
    }
  )
);

export default useRulesStore;
