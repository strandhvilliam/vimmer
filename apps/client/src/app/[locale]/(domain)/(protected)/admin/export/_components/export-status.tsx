"use client";

import { useEffect, useState } from "react";
import { Progress } from "@vimmer/ui/components/progress";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@vimmer/ui/components/alert";
import { CheckCircle, Loader2 } from "lucide-react";

interface ExportStatusProps {
  type: "photos" | "participants" | "submissions" | "exif";
}

export function ExportStatus({ type }: ExportStatusProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 20, 100));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [progress]);

  return (
    <Alert className="w-full max-w-md mx-auto mt-4">
      <div className="flex items-center gap-2 mb-2">
        {isComplete ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        )}
        <AlertTitle className={isComplete ? "text-green-600" : "text-blue-600"}>
          {isComplete ? "Export Complete" : "Exporting..."}
        </AlertTitle>
      </div>
      <AlertDescription>
        {isComplete
          ? `The ${type} export has finished successfully.`
          : `Exporting ${type} data. Please wait...`}
        <Progress value={progress} className="mt-3" />
        <div className="text-xs text-muted-foreground mt-1">
          {isComplete ? "100%" : `${Math.round(progress)}%`}
        </div>
      </AlertDescription>
    </Alert>
  );
}
