import { runValidations } from "@vimmer/validation/validator"
import { RuleConfig, RuleKey, ValidationResult } from "@vimmer/validation/types"
import { SelectedPhotoV2 } from "./types"
import exifr from "exifr"
import { toast } from "sonner"
import { generateThumbnailWithCallback } from "./image-resize"

interface ParsedAndValidatedPhotos {
  updatedPhotos: {
    file: File
    exif: { [key: string]: unknown }
    preview: string
    thumbnail?: string | null
    thumbnailLoading?: boolean
    orderIndex: number
  }[]
  validationResults: ValidationResult[]
}

export async function parseAndValidateFiles(
  currentPhotos: SelectedPhotoV2[],
  files: File[],
  ruleConfigs: RuleConfig<RuleKey>[],
  orderIndexes: number[],
  maxPhotos: number,
  updateThumbnail?: (fileName: string, thumbnail: string) => void
): Promise<ParsedAndValidatedPhotos> {
  const currentLength = currentPhotos.length
  const remainingSlots = maxPhotos - currentLength
  const sortedOrderIndexes = orderIndexes.sort((a, b) => a - b)

  console.log(files[0]?.type)

  const sameNamePhotos = files.filter((file) =>
    currentPhotos.some((p) => p.file.name === file.name)
  )
  if (sameNamePhotos.length > 0) {
    toast.error(
      `${(sameNamePhotos.map((f) => f.name) as string[]).join(", ")} already selected and not added`
    )
  }

  const uniqueNewPhotos = files.filter(
    (f) => !sameNamePhotos.some((p) => p.name === f.name)
  )

  if (uniqueNewPhotos.length > remainingSlots) {
    toast.warning(
      `More than ${remainingSlots} photos selected, only ${remainingSlots} will be added`
    )
  }

  const newPhotos = await Promise.all(
    uniqueNewPhotos.slice(0, remainingSlots).map(async (file, index) => {
      const orderIndex = sortedOrderIndexes[currentLength + index]
      if (!orderIndex && orderIndex !== 0) return null

      let exif = await parseExifData(file)
      console.log("exif", exif)

      if (!exif) {
        exif = {}
      }

      return {
        file,
        exif: exif as { [key: string]: unknown },
        preview: URL.createObjectURL(file),
        thumbnail: null,
        thumbnailLoading: true,
        orderIndex,
      }
    })
  )
  const validPhotos = newPhotos.filter(
    (photo) => photo !== null
  ) satisfies SelectedPhotoV2[]

  const sortedByTime = [...currentPhotos, ...validPhotos]
    .sort((a, b) => {
      const aDate = getExifDate(a.exif)
      const bDate = getExifDate(b.exif)
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      return new Date(aDate).getTime() - new Date(bDate).getTime()
    })
    .map((photo, index) => ({
      ...photo,
      orderIndex: sortedOrderIndexes[index] ?? -1,
    }))
    .filter((photo) => photo.orderIndex !== -1)

  const validationInputs = sortedByTime.map((photo) => ({
    exif: photo.exif,
    fileName: photo.file.name,
    fileSize: photo.file.size,
    orderIndex: photo.orderIndex,
    mimeType: photo.file.type,
  }))

  const validationResults = runValidations(ruleConfigs, validationInputs)

  // Generate thumbnails asynchronously using proper Zustand pattern
  validPhotos.map(async (photo) => {
    try {
      const thumbnail = await generateThumbnailWithCallback(
        photo.file,
        200,
        (stage) => {
          // Don't call updateThumbnail on worker-failed, only on final completion
          if (stage === "fallback-complete") {
            // Thumbnail generation completed (either worker success or fallback success)
            // The actual thumbnail will be set in the success block below
          }
        }
      )
      // Only call updateThumbnail when we have the final thumbnail
      updateThumbnail?.(photo.file.name, thumbnail)
    } catch (error) {
      console.error("Thumbnail generation failed:", error)
      // Set empty thumbnail and stop loading state
      updateThumbnail?.(photo.file.name, "")
    }
  })

  return {
    updatedPhotos: sortedByTime,
    validationResults,
  }
}

function getExifDate(exif: { [key: string]: unknown }) {
  if (!exif) return null
  if (exif.DateTimeOriginal) return exif.DateTimeOriginal as string
  if (exif.CreateDate) return exif.CreateDate as string
  return null
}

async function parseExifData(file: File) {
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
