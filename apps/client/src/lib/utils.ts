import { format } from "date-fns";
import { NextRequest } from "next/server";

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
