import { useForm } from "react-hook-form";
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

export interface RulesFormValues {
  max_file_size: Rule<MaxFileSizeParams>;
  allowed_file_types: Rule<AllowedFileTypesParams>;
  strict_timestamp_ordering: Rule<EmptyParams>;
  same_device: Rule<EmptyParams>;
  within_timerange: Rule<WithinTimerangeParams>;
  modified: Rule<EmptyParams>;
}

export function useRulesForm(defaultValues?: RulesFormValues) {
  return useForm<RulesFormValues>({
    defaultValues,
    mode: "onChange",
  });
}
