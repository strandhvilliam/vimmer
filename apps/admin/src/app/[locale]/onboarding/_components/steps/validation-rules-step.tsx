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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { Shield, FileImage, Clock, Smartphone, Edit, Zap } from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

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
      <Card className="border-0 shadow-xl">
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
              <div className="grid grid-cols-2 gap-4 pl-8">
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
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">MB</span>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select
                    value={rules.maxFileSize.severity}
                    onValueChange={(severity: "warning" | "error") =>
                      updateRule("maxFileSize", { severity })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <div className="pl-8">
                <Label>Severity</Label>
                <Select
                  value={rules.allowedFileTypes.severity}
                  onValueChange={(severity: "warning" | "error") =>
                    updateRule("allowedFileTypes", { severity })
                  }
                >
                  <SelectTrigger className="mt-1 max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently allows: JPEG, PNG
                </p>
              </div>
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
              <div className="pl-8">
                <Label>Severity</Label>
                <Select
                  value={rules.withinTimerange.severity}
                  onValueChange={(severity: "warning" | "error") =>
                    updateRule("withinTimerange", { severity })
                  }
                >
                  <SelectTrigger className="mt-1 max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Uses marathon start/end times from configuration
                </p>
              </div>
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
              <div className="pl-8">
                <Label>Severity</Label>
                <Select
                  value={rules.sameDevice.severity}
                  onValueChange={(severity: "warning" | "error") =>
                    updateRule("sameDevice", { severity })
                  }
                >
                  <SelectTrigger className="mt-1 max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <div className="pl-8">
                <Label>Severity</Label>
                <Select
                  value={rules.noModifications.severity}
                  onValueChange={(severity: "warning" | "error") =>
                    updateRule("noModifications", { severity })
                  }
                >
                  <SelectTrigger className="mt-1 max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <div className="pl-8">
                <Label>Severity</Label>
                <Select
                  value={rules.strictTimestampOrdering.severity}
                  onValueChange={(severity: "warning" | "error") =>
                    updateRule("strictTimestampOrdering", { severity })
                  }
                >
                  <SelectTrigger className="mt-1 max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
