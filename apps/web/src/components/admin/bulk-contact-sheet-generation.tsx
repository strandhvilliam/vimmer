"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import { Badge } from "@vimmer/ui/components/badge";
import { ScrollIcon, Loader2 } from "lucide-react";
import { useDomain } from "@/contexts/domain-context";
import { runBulkSheetGenerationQueue } from "@/actions/run-bulk-sheet-generation-queue";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useState } from "react";

interface BulkContactSheetGenerationProps {
  verifiedParticipantsCount: number;
  disabled?: boolean;
}

export function BulkContactSheetGeneration({
  verifiedParticipantsCount,
  disabled = false,
}: BulkContactSheetGenerationProps) {
  const { domain } = useDomain();
  const [lastResult, setLastResult] = useState<{
    queued: number;
    failed: number;
    total: number;
    message: string;
  } | null>(null);

  const { execute: runBulkGeneration, isExecuting } = useAction(
    runBulkSheetGenerationQueue,
    {
      onSuccess: (result) => {
        if (result.data) {
          setLastResult(result.data as any);
          if (result.data.queued > 0) {
            toast.success("Bulk contact sheet generation started", {
              description: result.data.message,
            });
          } else {
            toast.info("No participants ready for generation", {
              description: result.data.message,
            });
          }
        }
      },
      onError: (error) => {
        toast.error("Failed to start bulk contact sheet generation", {
          description: error.error.serverError || "An unknown error occurred",
        });
        console.error("Bulk contact sheet generation failed:", error);
      },
    },
  );

  const handleBulkGeneration = () => {
    runBulkGeneration({ domain });
  };

  const getStatusColor = () => {
    if (verifiedParticipantsCount === 0) return "text-gray-500";
    return "text-blue-600";
  };

  const getStatusText = () => {
    if (verifiedParticipantsCount === 0) return "No verified participants";
    return `${verifiedParticipantsCount} verified participants`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollIcon className="h-5 w-5" />
          Bulk Contact Sheet Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate contact sheets for all verified participants whose
          submissions have preview images ready. This will queue all eligible
          participants for batch processing.
        </p>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>

          <Button
            onClick={handleBulkGeneration}
            disabled={
              disabled || isExecuting || verifiedParticipantsCount === 0
            }
            className="min-w-32"
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate All"
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Last Generation Result</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Total: {lastResult.total}</Badge>
              <Badge variant="default">Queued: {lastResult.queued}</Badge>
              {lastResult.failed > 0 && (
                <Badge variant="destructive">Failed: {lastResult.failed}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastResult.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
