import { runZipGenerationAction } from "@/actions/run-zip-generation";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  ZippedSubmission,
  Participant,
  CompetitionClass,
  DeviceGroup,
  Submission,
} from "@vimmer/api/db/types";
import { Button } from "@vimmer/ui/components/button";
import { Card, CardContent } from "@vimmer/ui/components/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@vimmer/ui/components/popover";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Slider } from "@vimmer/ui/components/slider";
import { toast } from "sonner";
import { cn } from "@vimmer/ui/lib/utils";
import { AlertTriangle, Download, RefreshCcw, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface ParticipantExportCardProps {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
    submissions?: Submission[];
    zippedSubmissions?: ZippedSubmission[];
  };
}

export function ParticipantExportCard({
  participant,
}: ParticipantExportCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { execute: runZipGeneration, result: zipGenerationResult } = useAction(
    runZipGenerationAction,
    {
      onSuccess: () => {
        toast.success("Zip generation started - come back soon!");
      },
      onError: () => {
        toast.error("Failed to start zip generation");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.submissions.pathKey(),
        });
      },
    },
  );

  const parseErrors = (errors: unknown) => {
    try {
      console.log(errors);
      if (errors === undefined) return {};
      if (typeof errors === "object") return errors;
      return JSON.parse(errors as string);
    } catch (error) {
      console.error("Error parsing errors:", error);
    }
  };

  const zippedSubmission = participant.zippedSubmissions?.[0];

  if (zippedSubmission?.zipKey && zippedSubmission.status === "completed") {
    return null;
  }

  return (
    <Card
      className={cn(
        "border-2 items-center flex",
        zippedSubmission && zippedSubmission.status === "processing"
          ? "border-blue-200 bg-blue-50"
          : zippedSubmission &&
              (zippedSubmission.status === "error" ||
                Object.keys(parseErrors(zippedSubmission.errors)).length !== 0)
            ? "border-red-200 bg-red-50"
            : "border-orange-200 bg-orange-50",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2",
              zippedSubmission && zippedSubmission.status === "processing"
                ? "text-blue-600"
                : zippedSubmission &&
                    (zippedSubmission.status === "error" ||
                      Object.keys(parseErrors(zippedSubmission.errors))
                        .length !== 0)
                  ? "text-red-600"
                  : "text-orange-600",
            )}
          >
            {zippedSubmission && zippedSubmission.status === "processing" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : zippedSubmission &&
              (zippedSubmission.status === "error" ||
                Object.keys(parseErrors(zippedSubmission.errors)).length !==
                  0) ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-sm",
                zippedSubmission && zippedSubmission.status === "processing"
                  ? "text-blue-600"
                  : zippedSubmission &&
                      (zippedSubmission.status === "error" ||
                        Object.keys(parseErrors(zippedSubmission.errors))
                          .length !== 0)
                    ? "text-red-600"
                    : "text-orange-600",
              )}
            >
              <span className="font-normal text-muted-foreground">Export:</span>{" "}
              {participant.status === "verified" &&
              zippedSubmission &&
              zippedSubmission.status === "processing"
                ? "Generating..."
                : zippedSubmission &&
                    (zippedSubmission.status === "error" ||
                      Object.keys(parseErrors(zippedSubmission.errors))
                        .length !== 0)
                  ? "Generation Failed"
                  : "No Zip Available"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {zippedSubmission && zippedSubmission.status === "processing"
                ? "Being generated, come back soon"
                : zippedSubmission &&
                    (zippedSubmission.status === "error" ||
                      Object.keys(parseErrors(zippedSubmission.errors))
                        .length !== 0)
                  ? "An error occurred during generation"
                  : "Generate a zip file of all submissions for download"}
            </p>

            {zippedSubmission &&
              zippedSubmission.status === "processing" &&
              zippedSubmission.progress !== undefined && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-blue-600 font-medium">
                      {zippedSubmission.progress}%
                    </span>
                  </div>
                  <Slider
                    hideThumb
                    value={[zippedSubmission.progress]}
                    max={100}
                    step={1}
                    className="w-full border rounded-full"
                    disabled
                  />
                </div>
              )}

            <div className="flex items-center gap-2 mt-1">
              {zippedSubmission &&
              (zippedSubmission.status === "error" ||
                Object.keys(parseErrors(zippedSubmission.errors)).length !==
                  0) ? (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        View Error
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Generation Error
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {zipGenerationResult?.serverError ||
                            (zippedSubmission?.errors &&
                            typeof zippedSubmission.errors === "object"
                              ? JSON.stringify(zippedSubmission.errors)
                              : "An unknown error occurred during zip generation")}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <PrimaryButton
                    className="w-fit h-8 text-xs"
                    onClick={() =>
                      runZipGeneration({
                        participantReference: participant.reference,
                        domain: participant.domain,
                        exportType: "zip_submissions",
                      })
                    }
                    hoverPrimaryColor="#dc2626"
                    secondaryColor="#ef4444"
                    primaryColor="#f87171"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Retry
                  </PrimaryButton>
                </>
              ) : !(
                  zippedSubmission && zippedSubmission.status === "processing"
                ) ? (
                <PrimaryButton
                  className="w-fit h-8 text-xs"
                  onClick={() =>
                    runZipGeneration({
                      participantReference: participant.reference,
                      domain: participant.domain,
                      exportType: "zip_submissions",
                    })
                  }
                  hoverPrimaryColor="#ea580c"
                  secondaryColor="#f97316"
                  primaryColor="#fb923c"
                >
                  <Download className="h-3.5 w-3.5" />
                  Generate Zip
                </PrimaryButton>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
