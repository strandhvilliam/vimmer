"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Loader,
  Mail,
  MoreHorizontal,
  Shield,
  Smartphone,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Badge } from "@vimmer/ui/components/badge";
import type {
  CompetitionClass,
  DeviceGroup,
  Participant,
  ValidationResult,
} from "@vimmer/api/db/types";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vimmer/ui/components/dropdown-menu";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { cn } from "@vimmer/ui/lib/utils";
import { useAction } from "next-safe-action/hooks";
import { verifyParticipant } from "../_actions/verify-participant";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useSession } from "@/hooks/use-session";

interface ParticipantHeaderProps {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
  validationResults?: ValidationResult[];
}

function getDeviceIcon(icon: string) {
  switch (icon) {
    case "smartphone":
      return <Smartphone className="h-5 w-5" />;
    case "action-camera":
      return <Zap className="h-5 w-5" />;
    default:
      return <Camera className="h-5 w-5" />;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "initialized":
      return {
        icon: <Clock className="h-5 w-5" />,
        label: "Initialized",
        description: "Participant has been created but not started",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
      };
    case "ready_to_upload":
      return {
        icon: <Upload className="h-5 w-5" />,
        label: "Ready to Upload",
        description: "Participant can start uploading photos",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    case "processing":
      return {
        icon: <Loader className="h-5 w-5 animate-spin" />,
        label: "Processing",
        description: "Photos are being processed and validated",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    case "completed":
      return {
        icon: <Shield className="h-5 w-5" />,
        label: "Submitted",
        description: "All photos uploaded, awaiting staff verification",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    case "verified":
      return {
        icon: <CheckCircle className="h-5 w-5" />,
        label: "Verified",
        description: "Submission has been uploaded and verified",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    default:
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        label: status,
        description: "Unknown status",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
      };
  }
}

export function ParticipantHeader({
  participant,
  validationResults = [],
}: ParticipantHeaderProps) {
  const trpc = useTRPC();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const globalValidations = validationResults.filter(
    (result) => !result.fileName
  );

  const hasFailedValidations = globalValidations.some(
    (result) => result.outcome === "failed"
  );

  const hasErrors = globalValidations.some(
    (result) => result.severity === "error" && result.outcome === "failed"
  );

  const hasWarnings = globalValidations.some(
    (result) => result.severity === "warning" && result.outcome === "failed"
  );

  const allPassed = globalValidations.length > 0 && !hasFailedValidations;

  const statusConfig = getStatusConfig(participant.status);

  const { mutate: verifyParticipant, isPending: isVerifying } = useMutation(
    trpc.validations.createParticipantVerification.mutationOptions({
      onSuccess: () => {
        toast.success("Participant verified successfully");
      },
      onError: () => {
        toast.error("Failed to verify participant");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.validations.pathKey(),
        });
      },
    })
  );

  const handleVerifyParticipant = () => {
    if (!user?.id) {
      toast.error("Unable to determine logged in user");
      return;
    }

    verifyParticipant({
      data: {
        participantId: participant.id,
        staffId: user?.id,
        notes: "Verified from admin panel",
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href={`/admin/submissions`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
                {`#${participant.reference} - `}
                {`${participant.firstname} ${participant.lastname}`}
              </h1>
              {globalValidations.length > 0 && (
                <Badge
                  className={cn(
                    "ml-2",
                    allPassed
                      ? "bg-green-500/15 text-green-600 hover:bg-green-500/20"
                      : hasErrors
                        ? "bg-destructive/15 text-destructive hover:bg-destructive/20"
                        : "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20"
                  )}
                >
                  {allPassed ? (
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  ) : hasErrors ? (
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  )}
                  {allPassed ? "Valid" : hasErrors ? "Error" : "Warning"}
                </Badge>
              )}
            </div>
            <Link
              href={`mailto:${participant.email}`}
              className="text-sm text-muted-foreground flex items-center gap-1 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{participant.email}</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {participant.status !== "verified" && (
            <PrimaryButton
              onClick={handleVerifyParticipant}
              disabled={isVerifying}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isVerifying ? "Verifying..." : "Verify"}
            </PrimaryButton>
          )}
          <Button size="sm" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {/* Dropdown for additional actions */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Delete participant</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className={cn(
            "border-2 items-center flex",
            statusConfig.borderColor,
            statusConfig.bgColor
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2", statusConfig.color)}>
                {statusConfig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn("font-semibold text-sm", statusConfig.color)}>
                  {statusConfig.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {statusConfig.description}
                </p>
                {participant.status === "completed" && (
                  <PrimaryButton
                    className="mt-1 w-fit h-8 text-xs"
                    onClick={handleVerifyParticipant}
                    disabled={isVerifying}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {isVerifying ? "Verifying..." : "Verify Now"}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competition Class Card */}
        <Card className="hover:shadow-sm transition-shadow items-center flex">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="w-5 h-5 text-center text-sm font-bold font-mono flex items-center justify-center">
                        {participant.competitionClass?.numberOfPhotos || "?"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Number of photos required:{" "}
                        {participant.competitionClass?.numberOfPhotos ||
                          "Unknown"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {participant.competitionClass?.name || "No class assigned"}
                </h3>
                {participant.competitionClass?.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {participant.competitionClass.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Group Card */}
        <Card className="hover:shadow-sm transition-shadow items-center flex">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center justify-center">
                        {participant.deviceGroup ? (
                          getDeviceIcon(participant.deviceGroup.icon)
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Device type:{" "}
                        {participant.deviceGroup?.icon || "Unknown"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {participant.deviceGroup?.name || "No device group"}
                </h3>
                {participant.deviceGroup?.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {participant.deviceGroup.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
