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

export const EXPORT_KEYS = {
  EXIF: "exif",
  XLSX_PARTICIPANTS: "xlsx_participants",
  XLSX_SUBMISSIONS: "xlsx_submissions",
  ZIP_CONTACT_SHEETS: "zip_contact_sheets",
} as const;

interface ExportOptionsProps {
  domain: string;
  type: (typeof EXPORT_KEYS)[keyof typeof EXPORT_KEYS];
  label: string;
  disabled?: boolean;
}

export function ExportOptions({
  domain,
  type,
  label,
  disabled = false,
}: ExportOptionsProps) {
  const [format, setFormat] = useState<string>("json");
  const [isLoading, setIsLoading] = useState(false);

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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension =
        type === EXPORT_KEYS.EXIF
          ? format
          : type === EXPORT_KEYS.ZIP_CONTACT_SHEETS
            ? "zip"
            : "xlsx";
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
        disabled={isLoading || disabled}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Exporting..." : label}
      </Button>
    </div>
  );
}
