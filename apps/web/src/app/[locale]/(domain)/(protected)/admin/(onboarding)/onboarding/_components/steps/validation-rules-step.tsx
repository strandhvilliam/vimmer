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
import { Label } from "@vimmer/ui/components/label";
import { Slider } from "@vimmer/ui/components/slider";
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
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { cn } from "@vimmer/ui/lib/utils";
import { motion } from "motion/react";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

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
  maxFileSize: {
    enabled: boolean;
    severity: "warning" | "error";
    params: { maxBytes: number };
  };
  allowedFileTypes: {
    enabled: boolean;
    severity: "warning" | "error";
    params: { allowedFileTypes: string[] };
  };
  withinTimerange: {
    enabled: boolean;
    severity: "warning" | "error";
    params: { start: string; end: string };
  };
  sameDevice: {
    enabled: boolean;
    severity: "warning" | "error";
  };
  noModifications: {
    enabled: boolean;
    severity: "warning" | "error";
  };
  strictTimestampOrdering: {
    enabled: boolean;
    severity: "warning" | "error";
  };
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

const fileTypeOptions = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
];

export function ValidationRulesStep({
  onNext,
  onPrev,
  canGoBack,
}: ValidationRulesStepProps) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();

  // Fetch marathon and rules data
  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain })
  );

  const { data: existingRules } = useSuspenseQuery(
    trpc.rules.getByDomain.queryOptions({ domain })
  );

  // Update rules mutation
  const { mutate: updateRules, isPending: isUpdating } = useMutation(
    trpc.rules.updateMultiple.mutationOptions({
      onSuccess: () => {
        toast.success("Validation rules updated successfully");
        onNext();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update validation rules");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.rules.pathKey(),
        });
      },
    })
  );

  const initializeRulesFromDb = (): RulesState => {
    const defaultRules: RulesState = {
      maxFileSize: {
        enabled: true,
        severity: "error",
        params: { maxBytes: 5 * 1024 * 1024 }, // 5MB
      },
      allowedFileTypes: {
        enabled: true,
        severity: "error",
        params: { allowedFileTypes: ["jpg", "png"] },
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
    };

    const maxFileSizeRule = existingRules.find(
      (rule) => rule.ruleKey === "max_file_size"
    );
    if (maxFileSizeRule && (maxFileSizeRule.params as any)?.maxBytes) {
      defaultRules.maxFileSize = {
        enabled: maxFileSizeRule.enabled,
        severity: maxFileSizeRule.severity as "warning" | "error",
        params: { maxBytes: (maxFileSizeRule.params as any).maxBytes },
      };
    }

    const allowedFileTypesRule = existingRules.find(
      (rule) => rule.ruleKey === "allowed_file_types"
    );
    if (
      allowedFileTypesRule &&
      (allowedFileTypesRule.params as any)?.allowedFileTypes
    ) {
      defaultRules.allowedFileTypes = {
        enabled: allowedFileTypesRule.enabled,
        severity: allowedFileTypesRule.severity as "warning" | "error",
        params: {
          allowedFileTypes: (allowedFileTypesRule.params as any)
            .allowedFileTypes,
        },
      };
    }

    const withinTimerangeRule = existingRules.find(
      (rule) => rule.ruleKey === "within_timerange"
    );
    if (
      withinTimerangeRule &&
      (withinTimerangeRule.params as any)?.start !== undefined &&
      (withinTimerangeRule.params as any)?.end !== undefined
    ) {
      defaultRules.withinTimerange = {
        enabled: withinTimerangeRule.enabled,
        severity: withinTimerangeRule.severity as "warning" | "error",
        params: {
          start: (withinTimerangeRule.params as any).start,
          end: (withinTimerangeRule.params as any).end,
        },
      };
    }

    const sameDeviceRule = existingRules.find(
      (rule) => rule.ruleKey === "same_device"
    );
    if (sameDeviceRule) {
      defaultRules.sameDevice = {
        enabled: sameDeviceRule.enabled,
        severity: sameDeviceRule.severity as "warning" | "error",
      };
    }

    const noModificationsRule = existingRules.find(
      (rule) => rule.ruleKey === "modified"
    );
    if (noModificationsRule) {
      defaultRules.noModifications = {
        enabled: noModificationsRule.enabled,
        severity: noModificationsRule.severity as "warning" | "error",
      };
    }

    const strictTimestampOrderingRule = existingRules.find(
      (rule) => rule.ruleKey === "strict_timestamp_ordering"
    );
    if (strictTimestampOrderingRule) {
      defaultRules.strictTimestampOrdering = {
        enabled: strictTimestampOrderingRule.enabled,
        severity: strictTimestampOrderingRule.severity as "warning" | "error",
      };
    }

    return defaultRules;
  };

  const [rules, setRules] = useState<RulesState>(initializeRulesFromDb);

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
    if (!marathon?.id) {
      toast.error("Marathon not found");
      return;
    }

    const ruleConfigs = [
      {
        ruleKey: "max_file_size",
        enabled: rules.maxFileSize.enabled,
        severity: rules.maxFileSize.severity,
        params: rules.maxFileSize.params,
      },
      {
        ruleKey: "allowed_file_types",
        enabled: rules.allowedFileTypes.enabled,
        severity: rules.allowedFileTypes.severity,
        params: rules.allowedFileTypes.params,
      },
      {
        ruleKey: "within_timerange",
        enabled: rules.withinTimerange.enabled,
        severity: rules.withinTimerange.severity,
        params: rules.withinTimerange.params,
      },
      {
        ruleKey: "same_device",
        enabled: rules.sameDevice.enabled,
        severity: rules.sameDevice.severity,
        params: null,
      },
      {
        ruleKey: "modified",
        enabled: rules.noModifications.enabled,
        severity: rules.noModifications.severity,
        params: null,
      },
      {
        ruleKey: "strict_timestamp_ordering",
        enabled: rules.strictTimestampOrdering.enabled,
        severity: rules.strictTimestampOrdering.severity,
        params: null,
      },
    ];

    console.log(ruleConfigs);

    updateRules({
      domain,
      data: ruleConfigs,
    });
  };

  const getMbValue = (bytes: number) => Math.round(bytes / (1024 * 1024));

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
                    Set the largest allowed file size for individual photos
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.maxFileSize.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("maxFileSize", { enabled })
                }
                disabled={isUpdating}
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
                <div className="space-y-4 max-w-md w-full">
                  <div>
                    <Label
                      htmlFor="maxFileSize"
                      className="text-sm font-medium"
                    >
                      Limit:{" "}
                      <span className="text-primary font-semibold tabular-nums bg-muted px-2 py-1 rounded-md">
                        {getMbValue(rules.maxFileSize.params.maxBytes)} MB
                      </span>
                    </Label>
                    <Slider
                      id="maxFileSize"
                      min={1}
                      max={100}
                      step={1}
                      value={[getMbValue(rules.maxFileSize.params.maxBytes)]}
                      onValueChange={(values) => {
                        const value = values[0];
                        if (typeof value === "number") {
                          updateRule("maxFileSize", {
                            params: { maxBytes: value * 1024 * 1024 },
                          });
                        }
                      }}
                      className="cursor-pointer mt-2"
                      disabled={isUpdating}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span>1 MB</span>
                      <span>100 MB</span>
                    </div>
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
                    Specify permitted image file formats
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.allowedFileTypes.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("allowedFileTypes", { enabled })
                }
                disabled={isUpdating}
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
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {fileTypeOptions.map((option) => {
                      const isSelected =
                        rules.allowedFileTypes.params.allowedFileTypes.includes(
                          option.value
                        );
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const currentTypes = [
                              ...rules.allowedFileTypes.params.allowedFileTypes,
                            ];
                            const index = currentTypes.indexOf(option.value);

                            if (index > -1) {
                              currentTypes.splice(index, 1);
                            } else {
                              currentTypes.push(option.value);
                            }
                            updateRule("allowedFileTypes", {
                              params: { allowedFileTypes: currentTypes },
                            });
                          }}
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-medium",
                            "border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                            isSelected
                              ? "bg-primary text-primary-foreground border-transparent shadow-sm hover:bg-primary/90"
                              : "bg-secondary/60 hover:bg-secondary text-secondary-foreground border-border/50"
                          )}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          disabled={isUpdating}
                        >
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 opacity-80" />
                          )}
                          {option.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  {rules.allowedFileTypes.params.allowedFileTypes.length ===
                    0 && (
                    <p className="text-sm text-amber-700 bg-amber-50 py-2 px-3 rounded-md border border-amber-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Warning: No file types selected. Users won't be able to
                      upload anything.
                    </p>
                  )}
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
                    Verify photos were taken during the specified competition
                    timeframe
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.withinTimerange.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("withinTimerange", { enabled })
                }
                disabled={isUpdating}
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
                <div className="flex-1">
                  <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium">
                        Competition Start Time
                      </div>
                      <div className="text-sm text-foreground">
                        {marathon?.startDate
                          ? format(
                              new Date(marathon.startDate),
                              "yyyy-MM-dd HH:mm"
                            )
                          : "Not set"}
                      </div>
                    </div>
                    <div className="space-y-1.5 border-l border-border pl-4">
                      <div className="text-xs font-medium">
                        Competition End Time
                      </div>
                      <div className="text-sm text-foreground">
                        {marathon?.endDate
                          ? format(
                              new Date(marathon.endDate),
                              "yyyy-MM-dd HH:mm"
                            )
                          : "Not set"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground">
                      You can configure the start and end time of the marathon
                      in the previous step
                    </span>
                  </div>
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
                    Require all photos in a single submission to originate from
                    the same camera/device
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.sameDevice.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("sameDevice", { enabled })
                }
                disabled={isUpdating}
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
                  <h3 className="font-semibold">No Digital Modifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Detect if photos show signs of editing in software like
                    Photoshop, Lightroom, etc.
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.noModifications.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("noModifications", { enabled })
                }
                disabled={isUpdating}
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
                    Ensure photo timestamps align chronologically with the theme
                    submission order
                  </p>
                </div>
              </div>
              <Switch
                checked={rules.strictTimestampOrdering.enabled}
                onCheckedChange={(enabled) =>
                  updateRule("strictTimestampOrdering", { enabled })
                }
                disabled={isUpdating}
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
              disabled={!canGoBack || isUpdating}
            >
              Back
            </Button>
            <PrimaryButton onClick={handleContinue} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Continue"}
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
