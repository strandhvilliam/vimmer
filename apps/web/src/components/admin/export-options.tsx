"use client";

import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import { Download, FolderOpen, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { getPresignedPhotoArchivesAction } from "../../lib/actions/get-presigned-photo-archives-action";
import { useZipSaver } from "@/hooks/use-zip-saver";

export const EXPORT_KEYS = {
  ZIP_PREVIEWS: "zip_previews",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_SUBMISSIONS: "zip_submissions",
  EXIF: "exif",
  XLSX_PARTICIPANTS: "xlsx_participants",
  XLSX_SUBMISSIONS: "xlsx_submissions",
} as const;

interface ExportOptionsProps {
  domain: string;
  type: (typeof EXPORT_KEYS)[keyof typeof EXPORT_KEYS];
  label: string;
  description: string;
  marathonId: string;
  isExternallyDisabled?: boolean;
}

export function ExportOptions({
  domain,
  type,
  label,
  description,
  marathonId,
  isExternallyDisabled,
}: ExportOptionsProps) {
  const [format, setFormat] = useState<string>("json");
  const [isLoading, setIsLoading] = useState(false);

  const zipSaver = useZipSaver();
  const { execute, isExecuting } = useAction(getPresignedPhotoArchivesAction, {
    onSuccess: async ({ data }) => {
      if (data && Array.isArray(data.presignedUrls)) {
        await zipSaver.savePhotos(data.presignedUrls);
      }
    },
    onError: (err) => {
      console.error("Failed to fetch presigned URLs", err);
    },
  });

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/${domain}/export/${type}?format=${format}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      if (
        type === EXPORT_KEYS.ZIP_PREVIEWS ||
        type === EXPORT_KEYS.ZIP_THUMBNAILS ||
        type === EXPORT_KEYS.ZIP_SUBMISSIONS
      ) {
        // This should never be called for ZIP types, but just in case
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = type === EXPORT_KEYS.EXIF ? format : "xlsx";
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export successful", {
        description: `Your ${type} data has been downloaded.`,
      });
    } catch (error) {
      toast.error("Export failed", {
        description: "There was an error exporting the data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ZIP export UI
  if (
    type === EXPORT_KEYS.ZIP_PREVIEWS ||
    type === EXPORT_KEYS.ZIP_THUMBNAILS ||
    type === EXPORT_KEYS.ZIP_SUBMISSIONS
  ) {
    return (
      <div className="space-y-4 border p-4 rounded-md bg-muted flex flex-col">
        <Button
          onClick={() => execute({ marathonId, domain: domain ?? "" })}
          disabled={zipSaver.isLoading || isExternallyDisabled || isExecuting}
          className="w-full"
        >
          {zipSaver.isLoading || isExecuting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="mr-2 h-4 w-4" />
          )}
          {zipSaver.isLoading || isExecuting
            ? zipSaver.statusMessage || "Processing..."
            : "Save to Local Folder"}
        </Button>
        {zipSaver.error && (
          <p className="text-sm text-red-500">Error: {zipSaver.error}</p>
        )}
        {!zipSaver.error &&
          zipSaver.statusMessage &&
          !zipSaver.isLoading &&
          !isExecuting && (
            <p className="text-sm text-green-500">{zipSaver.statusMessage}</p>
          )}
        <div className="flex items-center justify-end gap-2 mt-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
            alt="Google Chrome logo"
            style={{ height: 20, width: 20 }}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg"
            alt="Microsoft Edge logo"
            style={{ height: 20, width: 20 }}
          />
          <span className="text-xs text-muted-foreground ml-2">
            Chrome and Edge only
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {type === EXPORT_KEYS.EXIF && (
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="txt">Text</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button
        onClick={handleExport}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Exporting..." : label}
      </Button>
    </div>
  );
}
