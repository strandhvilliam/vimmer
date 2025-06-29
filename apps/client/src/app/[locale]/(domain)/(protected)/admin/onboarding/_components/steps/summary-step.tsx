"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import {
  CheckCircle,
  FileText,
  Shield,
  Trophy,
  Smartphone,
  Loader2,
} from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { cn } from "@vimmer/ui/lib/utils";

interface SummaryStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

export function SummaryStep({ onPrev, canGoBack }: SummaryStepProps) {
  const { data, completeOnboarding, isCompleting } = useOnboarding();

  const handleComplete = async () => {
    await completeOnboarding();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-rocgrotesk">
            Setup Summary
          </CardTitle>
          <CardDescription className="">
            Review your marathon configuration before going live
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Marathon Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Marathon Configuration</h3>
            </div>
            <div className=" rounded-lg p-4 space-y-3 border">
              <div>
                <span className="font-medium">Name:</span>{" "}
                {data.marathonConfig.name || "Not set"}
              </div>
              {data.marathonConfig.description && (
                <div>
                  <span className="font-medium">Description:</span>{" "}
                  {data.marathonConfig.description}
                </div>
              )}
              <div>
                <span className="font-medium">Start Date:</span>{" "}
                {formatDate(data.marathonConfig.startDate || undefined)}
              </div>
              <div>
                <span className="font-medium">End Date:</span>{" "}
                {formatDate(data.marathonConfig.endDate || undefined)}
              </div>
              {data.marathonConfig.logoUrl && (
                <div>
                  <span className="font-medium">Logo:</span>
                  <span className="text-vimmer-primary ml-2">Configured</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Rules */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Validation Rules</h3>
            </div>
            <div className="rounded-lg p-4 border">
              {data.validationRules.length > 0 ? (
                <div className="space-y-2">
                  {data.validationRules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">
                        {rule.ruleKey.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          Severity:{" "}
                        </span>
                        <Badge
                          className={cn(
                            "text-xs",
                            rule.severity === "error"
                              ? "bg-red-100 text-red-800 shadow-sm border border-red-200"
                              : "bg-amber-100 text-amber-800 shadow-sm border border-amber-200"
                          )}
                        >
                          {rule.severity === "error" ? "Restrict" : "Warning"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No validation rules configured
                </p>
              )}
            </div>
          </div>

          {/* Competition Classes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Competition Classes ({data.competitionClasses.length})
              </h3>
            </div>
            <div className="rounded-lg p-4 border">
              {data.competitionClasses.length > 0 ? (
                <div className="space-y-3">
                  {data.competitionClasses.map((competitionClass) => (
                    <div
                      key={competitionClass.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium">
                          {competitionClass.name}
                        </span>
                        {competitionClass.description && (
                          <p className="text-sm text-muted-foreground">
                            {competitionClass.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {competitionClass.numberOfPhotos} photos
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No competition classes configured
                </p>
              )}
            </div>
          </div>

          {/* Device Groups */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Device Groups ({data.deviceGroups.length})
              </h3>
            </div>
            <div className="rounded-lg p-4 border">
              {data.deviceGroups.length > 0 ? (
                <div className="space-y-3">
                  {data.deviceGroups.map((deviceGroup) => (
                    <div
                      key={deviceGroup.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium">{deviceGroup.name}</span>
                        {deviceGroup.description && (
                          <p className="text-sm text-muted-foreground">
                            {deviceGroup.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No device groups configured
                </p>
              )}
            </div>
          </div>

          {/* Completion Notice */}
          <div className="rounded-lg p-6 bg-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-vimmer-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-2">Ready to Launch!</h4>
                <p className="text-sm mb-4">
                  Your marathon is configured and ready to accept participants
                  when the start date is reached.
                </p>
                <p className="text-sm">
                  You can always modify these settings later from the dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={!canGoBack || isCompleting}
            >
              Back
            </Button>
            <PrimaryButton
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-8"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                "Complete Setup"
              )}
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
