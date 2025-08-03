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
  TXT_VALIDATION_RESULTS: "txt_validation_results",
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
  const [onlyFailed, setOnlyFailed] = useState<boolean>(true);
  const [fileFormat, setFileFormat] = useState<string>("single");

  const handleExport = async () => {
    try {
      setIsLoading(true);

      let url = `/api/${domain}/export/${type}`;
      const params = new URLSearchParams();

      if (type === EXPORT_KEYS.EXIF) {
        params.append("format", format);
      } else if (type === EXPORT_KEYS.TXT_VALIDATION_RESULTS) {
        params.append("onlyFailed", onlyFailed.toString());
        params.append("fileFormat", fileFormat);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      let extension = "txt";
      if (type === EXPORT_KEYS.EXIF) {
        extension = format;
      } else if (type === EXPORT_KEYS.ZIP_CONTACT_SHEETS) {
        extension = "zip";
      } else if (type === EXPORT_KEYS.TXT_VALIDATION_RESULTS) {
        extension = fileFormat === "folder" ? "zip" : "txt";
      } else {
        extension = "xlsx";
      }

      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
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
      {type === EXPORT_KEYS.TXT_VALIDATION_RESULTS && (
        <>
          <Select
            value={onlyFailed ? "failed" : "all"}
            onValueChange={(value) => setOnlyFailed(value === "failed")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="failed">Only Failed</SelectItem>
              <SelectItem value="all">All Results</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fileFormat} onValueChange={setFileFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single File</SelectItem>
              <SelectItem value="folder">Folder per Participant</SelectItem>
            </SelectContent>
          </Select>
        </>
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
