import exifr from "exifr"

export async function parseExifData(file: File) {
  try {
    const exif = await exifr.parse(file)
    if (!exif) {
      return null
    }

    const dateFields = [
      "DateTimeOriginal",
      "DateTimeDigitized",
      "CreateDate",
      "ModifyDate",
      "GPSDateTime",
      "GPSDate",
      "DateTime",
    ]

    for (const field of dateFields) {
      if (exif[field] && typeof exif[field] === "object") {
        try {
          exif[field] = exif[field].toISOString()
        } catch (error) {
          console.error("Error converting date field to ISO string:", error)
        }
      }
    }

    return sanitizeExifData(exif)
  } catch (error) {
    console.error("Error parsing EXIF data:", error)
    return null
  }
}

function sanitizeExifData(obj: any, visited = new WeakSet()): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (visited.has(obj)) {
    return "[Circular Reference]"
  }

  if (
    obj instanceof Uint8Array ||
    obj instanceof ArrayBuffer ||
    Buffer.isBuffer(obj)
  ) {
    return `[Binary Data: ${obj.byteLength} bytes]`
  }

  if (typeof obj === "string") {
    return obj.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    visited.add(obj)
    const result = obj.map((item) => sanitizeExifData(item, visited))
    visited.delete(obj)
    return result
  }

  if (typeof obj === "object") {
    visited.add(obj)
    const result: any = {}

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey =
        typeof key === "string"
          ? key.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          : key
      if (sanitizedKey) {
        result[sanitizedKey] = sanitizeExifData(value, visited)
      }
    }

    visited.delete(obj)
    return result
  }

  return obj
}
