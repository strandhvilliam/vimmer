"use client";

import { useParams } from "next/navigation";
import { Button } from "@vimmer/ui/components/button";
import { FolderOpen, Loader2 } from "lucide-react";
import { usePresignedPhotoSaver } from "@/hooks/usePresignedPhotoSaver";

interface PresignedPhotoSaverButtonProps {
  marathonId: string;
  onCloseDialog?: () => void;
}

export function PresignedPhotoSaverButton({
  marathonId,
  onCloseDialog,
}: PresignedPhotoSaverButtonProps) {
  const { domain } = useParams();
  const { isLoading, error, statusMessage, savePhotos } =
    usePresignedPhotoSaver();

  async function handleClick() {
    try {
      await savePhotos(marathonId, domain);
      if (onCloseDialog && !error) {
        onCloseDialog();
      }
    } catch (err) {
      console.error(
        "Button click handler caught an error (should be handled by hook):",
        err
      );
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleClick} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FolderOpen className="mr-2 h-4 w-4" />
        )}
        {isLoading ? statusMessage || "Processing..." : "Save to Local Folder"}
      </Button>
      {error && <p className="text-sm text-red-500">Error: {error}</p>}
      {!error && statusMessage && !isLoading && (
        <p className="text-sm text-green-500">{statusMessage}</p>
      )}
    </div>
  );
}
