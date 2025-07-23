import exifr from "exifr";

export async function parseExifData(file: Uint8Array<ArrayBufferLike>) {
  const exif = await exifr.parse(file);
  if (!exif) {
    throw new Error("No EXIF data");
  }

  const dateFields = [
    "DateTimeOriginal",
    "DateTimeDigitized",
    "CreateDate",
    "ModifyDate",
    "GPSDateTime",
    "GPSDate",
    "DateTime",
  ];

  for (const field of dateFields) {
    if (exif[field] && typeof exif[field] === "object") {
      try {
        exif[field] = exif[field].toISOString();
      } catch (error) {
        console.error("Error converting date field to ISO string:", error);
      }
    }
  }

  return exif;
}
