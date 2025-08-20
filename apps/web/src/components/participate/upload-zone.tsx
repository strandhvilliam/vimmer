"use client";

import { COMMON_IMAGE_EXTENSIONS } from "@/lib/constants";
import { Icon } from "@iconify/react";
import { Button } from "@vimmer/ui/components/button";
import { useI18n } from "@/locales/client";
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
  const t = useI18n();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    validator: (file) => {
      const fileExtension = file.name?.split(".").pop()?.trim()?.toLowerCase();
      if (!fileExtension || !COMMON_IMAGE_EXTENSIONS.includes(fileExtension)) {
        return {
          message: t("uploadSubmissions.invalidFileType", {
            extension: fileExtension ?? t("uploadSubmissions.noFileExtension"),
          }),
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
          {t("uploadZone.dragAndDrop")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("uploadCommon.countSummary", {
            current: currentCount,
            max: maxCount,
          })}
        </p>
        <Button variant="outline" disabled={isDisabled} className="mt-4">
          {t("uploadZone.selectPhotos")}
        </Button>
      </div>
    </div>
  );
}
