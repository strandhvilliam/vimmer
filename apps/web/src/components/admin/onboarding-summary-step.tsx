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
  Calendar,
} from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { cn } from "@vimmer/ui/lib/utils";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Marathon } from "@vimmer/api/db/types";

interface OnboardingSummaryStepProps {
  marathon: Marathon;
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

export function OnboardingSummaryStep({
  marathon,
  onPrev,
  canGoBack,
}: OnboardingSummaryStepProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch all the data for summary
  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({
      domain: marathon.domain,
    }),
  );

  const { data: deviceGroups } = useSuspenseQuery(
    trpc.deviceGroups.getByDomain.queryOptions({
      domain: marathon.domain,
    }),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain: marathon.domain,
    }),
  );

  const { data: rules } = useSuspenseQuery(
    trpc.rules.getByDomain.queryOptions({
      domain: marathon.domain,
    }),
  );

  const { mutate: completeSetup, isPending: isCompleting } = useMutation(
    trpc.marathons.updateByDomain.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.marathons.pathKey(),
        });
        toast.success(
          "Marathon setup completed successfully! Redirecting to dashboard...",
        );

        if (process.env.NODE_ENV === "development") {
          router.push(
            `http://${marathon.domain}.localhost:3000/admin/dashboard`,
          );
        } else {
          router.push(`https://${marathon.domain}.blikka.app/admin/dashboard`);
        }
      },
      onError: (error) => {
        console.error("Failed to complete setup:", error);
        toast.error("Failed to complete setup. Please try again.");
      },
    }),
  );

  const handleComplete = () => {
    completeSetup({
      domain: marathon.domain,
      data: {
        setupCompleted: true,
      },
    });
  };

  const formatDate = (dateString?: string | null) => {
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
                {marathon.name || "Not set"}
              </div>
              {marathon.description && (
                <div>
                  <span className="font-medium">Description:</span>{" "}
                  {marathon.description}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Start Date:</span>{" "}
                {formatDate(marathon.startDate)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">End Date:</span>{" "}
                {formatDate(marathon.endDate)}
              </div>
              {marathon.logoUrl && (
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
              {rules.length > 0 ? (
                <div className="space-y-2">
                  {rules.map((rule, index) => (
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
                              : "bg-amber-100 text-amber-800 shadow-sm border border-amber-200",
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
                Competition Classes ({competitionClasses.length})
              </h3>
            </div>
            <div className="rounded-lg p-4 border">
              {competitionClasses.length > 0 ? (
                <div className="space-y-3">
                  {competitionClasses.map((competitionClass) => (
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
                Device Groups ({deviceGroups.length})
              </h3>
            </div>
            <div className="rounded-lg p-4 border">
              {deviceGroups.length > 0 ? (
                <div className="space-y-3">
                  {deviceGroups.map((deviceGroup) => (
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
                      <Badge variant="outline" className="capitalize">
                        {deviceGroup.icon}
                      </Badge>
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

          {/* Topics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Topics ({topics.length})
              </h3>
            </div>
            <div className="rounded-lg p-4 border">
              {topics.length > 0 ? (
                <div className="space-y-3">
                  {topics
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((topic, index) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span className="font-medium">{topic.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            topic.visibility === "public" &&
                              "bg-green-50 text-green-700",
                            topic.visibility === "private" &&
                              "bg-gray-50 text-gray-700",
                            topic.visibility === "scheduled" &&
                              "bg-blue-50 text-blue-700",
                          )}
                        >
                          {topic.visibility}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No topics configured</p>
              )}
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
              className="gap-2"
            >
              {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCompleting ? "Completing Setup..." : "Complete Setup"}
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
