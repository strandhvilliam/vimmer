import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { Submission } from "@vimmer/api/db/types";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

interface ParticipantThumbnailGenerationCardProps {
  shouldShow: boolean;
  submissionsNeedingThumbnails: Submission[];
  variantsGeneratorUrl: string;
}

export function ParticipantThumbnailGenerationCard({
  shouldShow,
  submissionsNeedingThumbnails,
  variantsGeneratorUrl,
}: ParticipantThumbnailGenerationCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  const handleGenerateThumbnails = async () => {
    if (!submissionsNeedingThumbnails.length) return;

    setIsGeneratingThumbnails(true);

    try {
      const submissionIds = submissionsNeedingThumbnails.map((s) => s.id);

      const response = await fetch(variantsGeneratorUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionIds }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.summary.successful > 0) {
        toast.success(
          `Generated thumbnails for ${result.summary.successful} submission${result.summary.successful > 1 ? "s" : ""}`,
        );
        queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        });
      }

      if (result.summary.failed > 0) {
        toast.error(
          `Failed to generate thumbnails for ${result.summary.failed} submission${result.summary.failed > 1 ? "s" : ""}`,
        );
      }
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      toast.error("Failed to generate thumbnails");
    } finally {
      setIsGeneratingThumbnails(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <Card className="border-2 border-blue-200 bg-blue-50 items-center flex">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 text-blue-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-blue-600">
              <span className="font-normal text-muted-foreground">
                Missing:
              </span>{" "}
              Thumbnails & Previews
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {submissionsNeedingThumbnails.length} submission
              {submissionsNeedingThumbnails.length > 1 ? "s" : ""} missing
              thumbnails or previews
            </p>
            <PrimaryButton
              className="mt-1 w-fit h-8 text-xs"
              onClick={handleGenerateThumbnails}
              disabled={isGeneratingThumbnails}
              hoverPrimaryColor="#1d4ed8"
              secondaryColor="#2563eb"
              primaryColor="#3b82f6"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              {isGeneratingThumbnails ? "Generating..." : "Generate Now"}
            </PrimaryButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
