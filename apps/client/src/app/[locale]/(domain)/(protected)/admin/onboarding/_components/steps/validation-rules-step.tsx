"use client";

import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Switch } from "@vimmer/ui/components/switch";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@vimmer/ui/components/tooltip";
import {
  FileImage,
  Clock,
  Smartphone,
  Edit,
  Zap,
  InfoIcon,
} from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { cn } from "@vimmer/ui/lib/utils";
import { motion } from "motion/react";

interface ValidationRulesStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

interface RuleConfig {
  enabled: boolean;
  severity: "warning" | "error";
  params?: any;
}

interface RulesState {
  maxFileSize: RuleConfig & { params: { maxBytes: number } };
  allowedFileTypes: RuleConfig & { params: { allowedFileTypes: string[] } };
  withinTimerange: RuleConfig & { params: { start: string; end: string } };
  sameDevice: RuleConfig;
  noModifications: RuleConfig;
  strictTimestampOrdering: RuleConfig;
}

interface SeverityToggleProps {
  severity: "warning" | "error";
  onSeverityChange: (severity: "warning" | "error") => void;
  recommendedSeverity: "warning" | "error";
}

function SeverityToggle({
  severity,
  onSeverityChange,
  recommendedSeverity,
}: SeverityToggleProps) {
  return (
    <div className="flex flex-col">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 mb-1.5 cursor-pointer">
              <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <p className={cn("text-xs text-muted-foreground")}>
                Recommended:{" "}
                {recommendedSeverity === "error" ? "Restrict" : "Warning"}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="flex flex-col gap-2 min-w-[220px]">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-xs text-red-600">
                  Restrict
                </span>
                <span className="text-xs text-muted-foreground">
                  Prevents the user from submitting
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-xs text-amber-500">
                  Warning
                </span>
                <span className="text-xs text-muted-foreground">
                  Warns the user, but allows submission
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1 bg-muted/60 rounded-full p-0.5 border border-border/60"
      >
        <motion.button
          type="button"
          onClick={() => onSeverityChange("warning")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1",
            severity === "warning"
              ? "bg-amber-100 text-amber-800 shadow-sm border border-amber-200"
              : "text-muted-foreground hover:bg-background/50"
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          aria-pressed={severity === "warning"}
        >
          Warning
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onSeverityChange("error")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1",
            severity === "error"
              ? "bg-red-100 text-red-800 shadow-sm border border-red-200"
              : "text-muted-foreground hover:bg-background/50"
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          aria-pressed={severity === "error"}
        >
          Restrict
        </motion.button>
      </motion.div>
    </div>
  );
}

export function ValidationRulesStep({
  onNext,
  onPrev,
  canGoBack,
}: ValidationRulesStepProps) {
  const { data, updateValidationRules } = useOnboarding();

  const [rules, setRules] = useState<RulesState>({
    maxFileSize: {
      enabled: true,
      severity: "error",
      params: { maxBytes: 5 * 1024 * 1024 }, // 5MB
    },
    allowedFileTypes: {
      enabled: true,
      severity: "error",
      params: { allowedFileTypes: ["image/jpeg", "image/png"] },
    },
    withinTimerange: {
      enabled: false,
      severity: "warning",
      params: { start: "", end: "" },
    },
    sameDevice: {
      enabled: false,
      severity: "warning",
    },
    noModifications: {
      enabled: true,
      severity: "error",
    },
    strictTimestampOrdering: {
      enabled: false,
      severity: "warning",
    },
  });

  const updateRule = (
    ruleKey: keyof RulesState,
    updates: Partial<RuleConfig>
  ) => {
    setRules((prev) => ({
      ...prev,
      [ruleKey]: { ...prev[ruleKey], ...updates },
    }));
  };

  const handleContinue = () => {
    // Convert rules to the format expected by the backend
    const ruleConfigs = Object.entries(rules)
      .filter(([_, rule]) => rule.enabled)
      .map(([key, rule]) => ({
        ruleKey: key,
        severity: rule.severity,
        params: rule.params || null,
        marathonId: 0, // Will be set when saving
      }));

    updateValidationRules(ruleConfigs as any);
    onNext();
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk">
            Validation Rules
          </CardTitle>
          <CardDescription className="">
            Configure rules to automatically validate photo submissions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Max File Size Rule */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileImage className="w-5 h-5 text-vimmer-primary" />
                <div>
                  <h3 className="font-semibold">Maximum File Size</h3>
                  <p className="text-sm text-muted-foreground">
                    Reject files larger than specified size
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.maxFileSize.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("maxFileSize", { enabled })
                }
              />
            </div>
            {rules.maxFileSize.enabled && (
              <motion.div
                initial={{ opacity: 0.5, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-between items-start"
              >
                <div className="space-y-4">
                  <div>
                    <Label>Max Size</Label>
                    <Input
                      type="number"
                      value={Math.round(
                        rules.maxFileSize.params.maxBytes / (1024 * 1024)
                      )}
                      onChange={(e) =>
                        updateRule("maxFileSize", {
                          params: {
                            maxBytes: parseInt(e.target.value) * 1024 * 1024,
                          },
                        })
                      }
                      className="mt-1 max-w-24"
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      MB
                    </span>
                  </div>
                </div>
                <SeverityToggle
                  severity={rules.maxFileSize.severity}
                  onSeverityChange={(severity) =>
                    updateRule("maxFileSize", { severity })
                  }
                  recommendedSeverity="error"
                />
              </motion.div>
            )}
          </div>

          {/* Allowed File Types Rule */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileImage className="w-5 h-5 text-vimmer-primary" />
                <div>
                  <h3 className="font-semibold">Allowed File Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Only accept specific image formats
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.allowedFileTypes.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("allowedFileTypes", { enabled })
                }
              />
            </div>
            {rules.allowedFileTypes.enabled && (
              <motion.div
                initial={{ opacity: 0.5, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-between items-start"
              >
                <div>
                  <p className="text-xs text-muted-foreground">
                    Currently allows: JPEG, PNG
                  </p>
                </div>
                <SeverityToggle
                  severity={rules.allowedFileTypes.severity}
                  onSeverityChange={(severity) =>
                    updateRule("allowedFileTypes", { severity })
                  }
                  recommendedSeverity="error"
                />
              </motion.div>
            )}
          </div>

          {/* Within Timerange Rule */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-vimmer-primary" />
                <div>
                  <h3 className="font-semibold">Within Time Range</h3>
                  <p className="text-sm text-muted-foreground">
                    Photos must be taken during marathon hours
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.withinTimerange.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("withinTimerange", { enabled })
                }
              />
            </div>
            {rules.withinTimerange.enabled && (
              <motion.div
                initial={{ opacity: 0.5, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-between items-start"
              >
                <div>
                  <p className="text-xs text-muted-foreground">
                    Uses marathon start/end times from configuration
                  </p>
                </div>
                <SeverityToggle
                  severity={rules.withinTimerange.severity}
                  onSeverityChange={(severity) =>
                    updateRule("withinTimerange", { severity })
                  }
                  recommendedSeverity="error"
                />
              </motion.div>
            )}
          </div>

          {/* Same Device Rule */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-vimmer-primary" />
                <div>
                  <h3 className="font-semibold">Same Device</h3>
                  <p className="text-sm text-muted-foreground">
                    All photos must be from the same camera/device
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.sameDevice.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("sameDevice", { enabled })
                }
              />
            </div>
            {rules.sameDevice.enabled && (
              <motion.div
                initial={{ opacity: 0.5, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-end items-start"
              >
                <SeverityToggle
                  severity={rules.sameDevice.severity}
                  onSeverityChange={(severity) =>
                    updateRule("sameDevice", { severity })
                  }
                  recommendedSeverity="warning"
                />
              </motion.div>
            )}
          </div>

          {/* No Modifications Rule */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-vimmer-primary" />
                <div>
                  <h3 className="font-semibold">No Modifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Photos must be unedited/original
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.noModifications.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("noModifications", { enabled })
                }
              />
            </div>
            {rules.noModifications.enabled && (
              <motion.div
                initial={{ opacity: 0.5, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-end items-start"
              >
                <SeverityToggle
                  severity={rules.noModifications.severity}
                  onSeverityChange={(severity) =>
                    updateRule("noModifications", { severity })
                  }
                  recommendedSeverity="warning"
                />
              </motion.div>
            )}
          </div>

          {/* Strict Timestamp Ordering Rule */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-vimmer-primary" />
                <div>
                  <h3 className="font-semibold">Strict Timestamp Ordering</h3>
                  <p className="text-sm text-muted-foreground">
                    Photos must be submitted in chronological order
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.strictTimestampOrdering.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("strictTimestampOrdering", { enabled })
                }
              />
            </div>
            {rules.strictTimestampOrdering.enabled && (
              <motion.div
                initial={{ opacity: 0.5, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden pt-4 border-t border-border/60 mt-4 flex justify-end items-start"
              >
                <SeverityToggle
                  severity={rules.strictTimestampOrdering.severity}
                  onSeverityChange={(severity) =>
                    updateRule("strictTimestampOrdering", { severity })
                  }
                  recommendedSeverity="warning"
                />
              </motion.div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={!canGoBack}
            >
              Back
            </Button>
            <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
