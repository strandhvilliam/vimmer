import { useForm } from "react-hook-form";
import { SeverityLevel } from "@vimmer/validation";
import { z } from "better-auth/client";

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
