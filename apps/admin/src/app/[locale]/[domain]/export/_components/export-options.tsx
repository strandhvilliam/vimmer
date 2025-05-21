"use client";

import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { toast } from "sonner";
import { EXPORT_KEYS } from "@/lib/constants";

interface ExportOptionsProps {
  domain: string;
  type: (typeof EXPORT_KEYS)[keyof typeof EXPORT_KEYS];
  label: string;
  description: string;
}

export function ExportOptions({
  domain,
  type,
  label,
  description,
}: ExportOptionsProps) {
  const [format, setFormat] = useState<string>("json");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      console.log(
        "Exporting",
        `/api/${domain}/export/${type}?format=${format}`
      );
      const response = await fetch(
        `/api/${domain}/export/${type}?format=${format}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        console.error(response.statusText);
        console.error(await response.text());
        throw new Error("Export failed");
      }

      if (
        type === EXPORT_KEYS.ZIP_PREVIEWS ||
        type === EXPORT_KEYS.ZIP_THUMBNAILS ||
        type === EXPORT_KEYS.ZIP_SUBMISSIONS
      ) {
        console.log("Zip generation started");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Set the correct file extension based on export type
      const extension = type === "exif" ? format : "xlsx";

      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export successful", {
        description: `Your ${type} data has been downloaded.`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Export failed", {
        description: "There was an error exporting the data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {type === "exif" && (
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
