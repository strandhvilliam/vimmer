import { format } from "date-fns";

export const parseDateFromExif = (exif?: Record<string, unknown>) => {
  if (!exif) return null;
  const dateFields = ["DateTimeOriginal", "CreateDate"]
    .map((field) => exif[field])
    .filter(Boolean);
  const date = dateFields.at(0);
  if (!date) return null;
  const formatted = format(new Date(date as string), "MMM d, yyyy kk:mm");
  return formatted;
};
