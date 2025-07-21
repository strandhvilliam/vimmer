"use client";

import { COMMON_IMAGE_EXTENSIONS } from "@/lib/constants";
import { Icon } from "@iconify/react";
import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { FileRejection, useDropzone } from "react-dropzone";

interface UploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDisabled: boolean;
  currentCount: number;
  maxCount: number;
  onDropRejected: (fileRejections: FileRejection[]) => void;
}

export function UploadZone({
  onDrop,
  isDisabled,
  currentCount,
  maxCount,
  onDropRejected,
}: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    validator: (file) => {
      const fileExtension = file.name?.split(".").pop()?.trim()?.toLowerCase();
      if (!fileExtension || !COMMON_IMAGE_EXTENSIONS.includes(fileExtension)) {
        return {
          message: `Invalid file type: ${fileExtension ?? "NO FILE EXTENSION"}`,
          code: "invalid-file-type",
        };
      }
      return null;
    },
    disabled: isDisabled,
    onDropRejected,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed border-muted-foreground/40 bg-background/60 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors
        ${isDragActive ? "border-primary bg-muted" : "border-muted"}
        ${isDisabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center flex flex-col justify-center items-center">
        <PrimaryButton className="flex items-center justify-center p-4 rounded-full mb-4">
          <Icon icon="solar:upload-broken" className="w-10 h-10 text-white" />
        </PrimaryButton>

        <p className="text-muted-foreground mb-2">
          Drag and drop your photos here, or click to select
        </p>
        <p className="text-sm text-muted-foreground">
          {currentCount} of {maxCount} photos uploaded
        </p>
        <Button variant="outline" disabled={isDisabled} className="mt-4">
          Select Photos
        </Button>
      </div>
    </div>
  );
}
