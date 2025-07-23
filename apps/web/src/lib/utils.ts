import { RuleConfig as DbRuleConfig } from "@vimmer/api/db/types";
import { RuleConfig, RuleKey } from "@vimmer/validation/types";
import { createRule } from "@vimmer/validation/validator";
import { format } from "date-fns";

export function parseDateFromExif(exif?: Record<string, unknown>) {
  if (!exif) return null;
  const dateFields = ["DateTimeOriginal", "CreateDate"]
    .map((field) => exif[field])
    .filter(Boolean);
  const date = dateFields.at(0);
  if (!date) return null;
  const formatted = format(new Date(date as string), "MMM d, yyyy kk:mm");
  return formatted;
}

export function formatSubmissionKey({
  ref,
  index,
  domain,
}: {
  domain: string;
  ref: string;
  index: number;
}) {
  const trimmedRef = ref.trim();
  const isOnlyDigits = /^\d+$/.test(trimmedRef);
  const displayRef = isOnlyDigits ? trimmedRef.padStart(4, "0") : trimmedRef;
  const displayIndex = (index + 1).toString().padStart(2, "0");
  const fileName = `${displayRef}_${displayIndex}.jpg`;
  return `${domain}/${displayRef}/${displayIndex}/${fileName}`;
}

export function mapDbRuleConfigsToValidationConfigs(
  dbRuleConfigs: DbRuleConfig[],
): RuleConfig<RuleKey>[] {
  return dbRuleConfigs
    .filter((rule) => rule.enabled)
    .map((rule) => {
      const ruleKey = rule.ruleKey as RuleKey;
      const severity = rule.severity as "error" | "warning";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return createRule(ruleKey, severity, rule.params as any);
    });
}

export function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
}

export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

export async function resizeImage(
  blob: Blob,
  targetWidth: number,
  filename: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const targetHeight = targetWidth * aspectRatio;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const mimeType = getMimeTypeFromExtension(filename);
      if (mimeType === "image/png") {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Use appropriate format and quality based on original image type
      const outputMimeType =
        mimeType === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputMimeType === "image/jpeg" ? 0.9 : undefined;

      canvas.toBlob(
        (resizedBlob) => {
          // Clean up
          URL.revokeObjectURL(img.src);

          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error("Failed to resize image"));
          }
        },
        outputMimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    const objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;
  });
}
